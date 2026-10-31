from __future__ import annotations

from typing import Protocol

from sqlalchemy import delete, insert, literal, select

from app.database.session_factory import ISessionFactory
from app.favorites.models.favorite import Favorite
from app.utils.di import inject


class IFavoriteRepository(Protocol):
    def ids(self, user_id: int) -> list[int]: ...
    def add(self, user_id: int, listing_id: int) -> None: ...
    def remove(self, user_id: int, listing_id: int) -> None: ...


@inject(alias=IFavoriteRepository)
class FavoriteRepository(IFavoriteRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._factory = session_factory

    def ids(self, user_id: int) -> list[int]:
        return list(
            self._factory().scalars(
                select(Favorite.listing_id)
                .where(Favorite.user_id == user_id)
                .order_by(Favorite.listing_id)
            )
        )

    def add(self, user_id: int, listing_id: int) -> None:
        session = self._factory()
        existing = (
            select(Favorite.id)
            .where(Favorite.user_id == user_id, Favorite.listing_id == listing_id)
            .exists()
        )
        # One atomic statement: repeated saves are harmless and the endpoint owns the commit.
        session.execute(
            insert(Favorite).from_select(
                ["user_id", "listing_id"],
                select(literal(user_id), literal(listing_id)).where(~existing),
            )
        )
        session.flush()

    def remove(self, user_id: int, listing_id: int) -> None:
        session = self._factory()
        session.execute(
            delete(Favorite).where(Favorite.user_id == user_id, Favorite.listing_id == listing_id)
        )
        session.flush()
