from __future__ import annotations

from functools import partial
from pathlib import Path
from typing import Protocol

from fastapi import UploadFile

from app.config.settings import Settings
from app.media.exceptions.media import (
    ImageTooLargeException,
    InvalidMediaPurposeException,
    MediaInUseException,
    MediaNotFoundException,
    MediaNotOwnerException,
)
from app.media.models.media import Media, MediaPurpose
from app.media.repositories.media import IMediaRepository
from app.media.schemas.media import MediaResponseSchema
from app.media.storage import IImageStorage
from app.utils.di import inject
from app.utils.image_location import MEDIA_KEY, local_media_key


class IMediaService(Protocol):
    def upload(
        self, file: UploadFile, purpose: MediaPurpose, user_id: int
    ) -> MediaResponseSchema: ...
    def file(self, key: str) -> Path: ...
    def remove(self, media_id: int, user_id: int) -> None: ...
    def resolve(
        self, urls: list[str], user_id: int, purpose: MediaPurpose
    ) -> list[tuple[str, int | None]]: ...
    def prune(self, urls: list[str], user_id: int) -> None: ...


@inject(alias=IMediaService)
class MediaService(IMediaService):
    def __init__(
        self, media_repository: IMediaRepository, image_storage: IImageStorage, settings: Settings
    ) -> None:
        self._repository = media_repository
        self._storage = image_storage
        self._settings = settings

    def upload(self, file: UploadFile, purpose: MediaPurpose, user_id: int) -> MediaResponseSchema:
        data = file.file.read(self._settings.MAX_UPLOAD_BYTES + 1)
        if len(data) > self._settings.MAX_UPLOAD_BYTES:
            raise ImageTooLargeException
        image = self._storage.encode(data, file.content_type or "")
        key = self._storage.write(image)
        media = Media(
            owner_id=user_id,
            purpose=purpose,
            storage_key=key,
            byte_size=len(image.data),
            width=image.width,
            height=image.height,
        )
        self._repository.add(media, lambda: self._storage.remove(key))
        return MediaResponseSchema.model_validate(media)

    def file(self, key: str) -> Path:
        if not MEDIA_KEY.fullmatch(key) or self._repository.by_key(key) is None:
            raise MediaNotFoundException
        result = self._storage.path(key)
        if not result.is_file():
            raise MediaNotFoundException
        return result

    def remove(self, media_id: int, user_id: int) -> None:
        media = self._repository.get(media_id)
        if media is None:
            raise MediaNotFoundException
        if media.owner_id != user_id:
            raise MediaNotOwnerException
        if self._repository.referenced(media.id):
            raise MediaInUseException
        key = media.storage_key
        self._repository.remove(media, lambda: self._storage.remove(key))

    def resolve(
        self, urls: list[str], user_id: int, purpose: MediaPurpose
    ) -> list[tuple[str, int | None]]:
        result: list[tuple[str, int | None]] = []
        keys = [key for url in urls if (key := local_media_key(url)) is not None]
        assets = self._repository.by_keys(keys)
        for url in urls:
            key = local_media_key(url)
            if key is None:
                result.append((url, None))
                continue
            media = assets.get(key)
            if media is None:
                raise MediaNotFoundException
            if media.owner_id != user_id:
                raise MediaNotOwnerException
            if media.purpose != purpose:
                raise InvalidMediaPurposeException
            result.append((media.url, media.id))
        return result

    def prune(self, urls: list[str], user_id: int) -> None:
        keys = [key for url in set(urls) if (key := local_media_key(url)) is not None]
        for media in self._repository.unused(keys, user_id):
            key = media.storage_key
            self._repository.remove(media, partial(self._storage.remove, key))
