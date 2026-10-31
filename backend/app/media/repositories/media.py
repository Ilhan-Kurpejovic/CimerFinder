from __future__ import annotations

from collections.abc import Callable
from typing import Protocol

from sqlalchemy import select

from app.database.session_factory import ISessionFactory
from app.database.transaction_hooks import on_transaction
from app.listings.models.photo import ListingPhoto
from app.media.models.media import Media
from app.users.models.user import User
from app.utils.di import inject


class IMediaRepository(Protocol):
    def get(self, media_id: int) -> Media | None: ...
    def by_key(self, key: str) -> Media | None: ...
    def by_keys(self, keys: list[str]) -> dict[str, Media]: ...
    def unused(self, keys: list[str], user_id: int) -> list[Media]: ...
    def add(self, media: Media, undo: Callable[[], None]) -> Media: ...
    def remove(self, media: Media, cleanup: Callable[[], None]) -> None: ...
    def referenced(self, media_id: int) -> bool: ...


@inject(alias=IMediaRepository)
class MediaRepository(IMediaRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._factory = session_factory

    def get(self, media_id: int) -> Media | None:
        return self._factory().get(Media, media_id)

    def by_key(self, key: str) -> Media | None:
        return self._factory().scalar(select(Media).where(Media.storage_key == key))

    def add(self, media: Media, undo: Callable[[], None]) -> Media:
        session = self._factory()
        on_transaction(session, "rollback", undo)
        session.add(media)
        session.flush()
        return media

    def remove(self, media: Media, cleanup: Callable[[], None]) -> None:
        session = self._factory()
        on_transaction(session, "commit", cleanup)
        session.delete(media)
        session.flush()

    def referenced(self, media_id: int) -> bool:
        session = self._factory()
        return (
            session.scalar(select(User.id).where(User.avatar_media_id == media_id).limit(1))
            is not None
            or session.scalar(
                select(ListingPhoto.id).where(ListingPhoto.media_id == media_id).limit(1)
            )
            is not None
        )

    def by_keys(self, keys: list[str]) -> dict[str, Media]:
        return {
            item.storage_key: item
            for item in self._factory().scalars(select(Media).where(Media.storage_key.in_(keys)))
        }

    def unused(self, keys: list[str], user_id: int) -> list[Media]:
        used_avatar = select(User.id).where(User.avatar_media_id == Media.id).exists()
        used_photo = select(ListingPhoto.id).where(ListingPhoto.media_id == Media.id).exists()
        return list(
            self._factory().scalars(
                select(Media).where(
                    Media.storage_key.in_(keys),
                    Media.owner_id == user_id,
                    ~used_avatar,
                    ~used_photo,
                )
            )
        )
