from __future__ import annotations

from typing import Protocol

from app.media.models.media import MediaPurpose
from app.media.services.media import IMediaService
from app.users.exceptions.user import UserNotFoundException
from app.users.repositories.user import IUserRepository
from app.users.schemas.user import PublicUserSchema, UserResponseSchema, UserUpdateRequestSchema
from app.utils.di import inject


class IUserService(Protocol):
    def get_public_profile(self, user_id: int) -> PublicUserSchema: ...
    def get_profile(self, user_id: int) -> UserResponseSchema: ...
    def update_profile(self, user_id: int, data: UserUpdateRequestSchema) -> UserResponseSchema: ...


@inject(alias=IUserService)
class UserService(IUserService):
    def __init__(self, user_repository: IUserRepository, media_service: IMediaService) -> None:
        self._user_repository = user_repository
        self._media = media_service

    def get_public_profile(self, user_id: int) -> PublicUserSchema:
        user = self._user_repository.get(user_id)
        if user is None:
            raise UserNotFoundException
        return PublicUserSchema.model_validate(user)

    def get_profile(self, user_id: int) -> UserResponseSchema:
        user = self._user_repository.get(user_id)
        if user is None:
            raise UserNotFoundException
        return UserResponseSchema.model_validate(user)

    def update_profile(self, user_id: int, data: UserUpdateRequestSchema) -> UserResponseSchema:
        user = self._user_repository.get(user_id)
        if user is None:
            raise UserNotFoundException
        previous = user.avatar_url
        resolved: list[tuple[str, int | None]] = []
        if "avatar_url" in data.model_fields_set:
            resolved = (
                self._media.resolve([data.avatar_url], user_id, MediaPurpose.AVATAR)
                if data.avatar_url
                else []
            )
            user.avatar_media_id = resolved[0][1] if resolved else None
        for name, value in data.model_dump(exclude_unset=True).items():
            if name == "avatar_url":
                value = resolved[0][0] if resolved else None
            setattr(user, name, value)
        result = UserResponseSchema.model_validate(self._user_repository.save(user))
        if previous and previous != user.avatar_url:
            self._media.prune([previous], user_id)
        return result
