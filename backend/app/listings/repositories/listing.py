from __future__ import annotations

from collections.abc import Sequence
from typing import Protocol

from sqlalchemy import select
from sqlalchemy.orm import joinedload, selectinload

from app.database.session_factory import ISessionFactory
from app.listings.models.listing import Listing, ListingStatus
from app.listings.models.photo import ListingPhoto
from app.listings.schemas.listing import ListingFilters
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams, paginate


class IListingRepository(Protocol):
    def list(
        self, filters: ListingFilters, pagination: PaginationParams, owner_id: int | None = None
    ) -> Page[Listing]: ...
    def get(self, listing_id: int) -> Listing | None: ...
    def save(self, listing: Listing) -> Listing: ...
    def replace_photos(
        self, listing: Listing, photos: Sequence[tuple[str, int | None]]
    ) -> None: ...
    def remove(self, listing: Listing) -> None: ...


@inject(alias=IListingRepository)
class ListingRepository(IListingRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._session_factory = session_factory

    def list(
        self, filters: ListingFilters, pagination: PaginationParams, owner_id: int | None = None
    ) -> Page[Listing]:
        query = select(Listing).options(joinedload(Listing.owner), selectinload(Listing.photos))
        if owner_id is not None:
            query = query.where(Listing.owner_id == owner_id)
        else:
            query = query.where(Listing.status == ListingStatus.ACTIVE)
        if filters.kind is not None:
            query = query.where(Listing.kind == filters.kind)
        if filters.city:
            query = query.where(Listing.city == filters.city)
        if filters.search:
            query = query.where(
                Listing.search_text.contains(filters.search.casefold(), autoescape=True)
            )
        if filters.max_price is not None:
            query = query.where(Listing.price <= filters.max_price)
        if filters.pet_friendly:
            query = query.where(Listing.pet_friendly.is_(True))
        if filters.ids is not None:
            query = query.where(Listing.id.in_(filters.ids))
        query = (
            query.order_by(Listing.price, Listing.id.desc())
            if filters.sort == "price"
            else query.order_by(Listing.created_at.desc(), Listing.id.desc())
        )
        return paginate(query=query, pagination_params=pagination, db=self._session_factory())

    def get(self, listing_id: int) -> Listing | None:
        return self._session_factory().scalar(
            select(Listing)
            .options(joinedload(Listing.owner), selectinload(Listing.photos))
            .where(Listing.id == listing_id)
        )

    def save(self, listing: Listing) -> Listing:
        session = self._session_factory()
        session.add(listing)
        session.flush()
        return listing

    def remove(self, listing: Listing) -> None:
        session = self._session_factory()
        session.delete(listing)
        session.flush()

    def replace_photos(self, listing: Listing, photos: Sequence[tuple[str, int | None]]) -> None:
        session = self._session_factory()
        listing.photos.clear()
        session.flush()
        listing.photos.extend(
            ListingPhoto(url=url, media_id=media_id, position=index)
            for index, (url, media_id) in enumerate(photos)
        )
        listing.image_url = photos[0][0] if photos else None
        session.flush()
