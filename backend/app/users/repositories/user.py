from __future__ import annotations

from typing import Protocol

from app.database.session_factory import ISessionFactory
from app.users.models.user import User
from app.utils.di import inject


class IUserRepository(Protocol):
    def get(self, user_id: int) -> User | None: ...
    def save(self, user: User) -> User: ...


@inject(alias=IUserRepository)
class UserRepository(IUserRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._session_factory = session_factory

    def get(self, user_id: int) -> User | None:
        return self._session_factory().get(User, user_id)

    def save(self, user: User) -> User:
        session = self._session_factory()
        session.add(user)
        session.flush()
        return user
