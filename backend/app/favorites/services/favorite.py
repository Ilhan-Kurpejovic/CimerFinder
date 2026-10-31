from __future__ import annotations

from typing import Protocol

from app.favorites.repositories.favorite import IFavoriteRepository
from app.listings.exceptions.listing import ListingNotFoundException
from app.listings.repositories.listing import IListingRepository
from app.utils.di import inject


class IFavoriteService(Protocol):
    def ids(self, user_id: int) -> list[int]: ...
    def add(self, user_id: int, listing_id: int) -> None: ...
    def remove(self, user_id: int, listing_id: int) -> None: ...


@inject(alias=IFavoriteService)
class FavoriteService(IFavoriteService):
    def __init__(
        self, favorite_repository: IFavoriteRepository, listing_repository: IListingRepository
    ) -> None:
        self._repository = favorite_repository
        self._listings = listing_repository

    def ids(self, user_id: int) -> list[int]:
        return self._repository.ids(user_id)

    def add(self, user_id: int, listing_id: int) -> None:
        if self._listings.get(listing_id) is None:
            raise ListingNotFoundException
        self._repository.add(user_id, listing_id)

    def remove(self, user_id: int, listing_id: int) -> None:
        self._repository.remove(user_id, listing_id)
