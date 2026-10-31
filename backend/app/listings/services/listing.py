from __future__ import annotations

from typing import Protocol

from app.auth.schemas.auth import CurrentUser
from app.listings.exceptions.listing import (
    ListingNotFoundException,
    NotListingOwnerException,
    ProfileIncompleteException,
)
from app.listings.models.listing import Listing
from app.listings.repositories.listing import IListingRepository
from app.listings.schemas.listing import (
    ListingCreateRequestSchema,
    ListingFilters,
    ListingResponseSchema,
    ListingUpdateRequestSchema,
)
from app.media.models.media import MediaPurpose
from app.media.services.media import IMediaService
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams


class IListingService(Protocol):
    def list(
        self, filters: ListingFilters, pagination: PaginationParams, owner_id: int | None = None
    ) -> Page[ListingResponseSchema]: ...
    def get(self, listing_id: int) -> ListingResponseSchema: ...
    def create(
        self, data: ListingCreateRequestSchema, current_user: CurrentUser
    ) -> ListingResponseSchema: ...
    def update(
        self, listing_id: int, data: ListingUpdateRequestSchema, current_user: CurrentUser
    ) -> ListingResponseSchema: ...
    def remove(self, listing_id: int, current_user: CurrentUser) -> None: ...


@inject(alias=IListingService)
class ListingService(IListingService):
    def __init__(
        self, listing_repository: IListingRepository, media_service: IMediaService
    ) -> None:
        self._repository = listing_repository
        self._media = media_service

    def list(
        self, filters: ListingFilters, pagination: PaginationParams, owner_id: int | None = None
    ) -> Page[ListingResponseSchema]:
        page = self._repository.list(filters, pagination, owner_id)
        return Page(
            total=page.total,
            pages=page.pages,
            items=[ListingResponseSchema.model_validate(item) for item in page.items],
        )

    def get(self, listing_id: int) -> ListingResponseSchema:
        return ListingResponseSchema.model_validate(self._get(listing_id))

    def create(
        self, data: ListingCreateRequestSchema, current_user: CurrentUser
    ) -> ListingResponseSchema:
        if current_user.age is None or len(current_user.occupation.strip()) < 2:
            raise ProfileIncompleteException
        values = data.model_dump(exclude={"image_urls"})
        urls = (
            data.image_urls
            if "image_urls" in data.model_fields_set
            else ([data.image_url] if data.image_url else [])
        )
        photos = (
            self._media.resolve(
                list(dict.fromkeys(urls or [])), current_user.id, MediaPurpose.LISTING
            )
            if data.kind == "room"
            else []
        )
        if data.image_url is not None:
            values["image_url"] = str(data.image_url)
        item = Listing(**values, owner_id=current_user.id, search_text="", pet_friendly=False)
        self._refresh_search(item)
        self._repository.save(item)
        self._repository.replace_photos(item, photos)
        return self.get(item.id)

    def update(
        self, listing_id: int, data: ListingUpdateRequestSchema, current_user: CurrentUser
    ) -> ListingResponseSchema:
        item = self._owned(listing_id, current_user)
        previous = item.image_urls
        values = data.model_dump(exclude_unset=True, exclude={"image_urls"})
        urls = (
            data.image_urls
            if "image_urls" in data.model_fields_set
            else (
                [data.image_url]
                if "image_url" in data.model_fields_set and data.image_url
                else ([] if "image_url" in data.model_fields_set else previous)
            )
        )
        kind = data.kind or item.kind
        photos = (
            self._media.resolve(
                list(dict.fromkeys(urls or [])), current_user.id, MediaPurpose.LISTING
            )
            if kind == "room"
            else []
        )
        for name, value in values.items():
            if name == "image_url" and value is not None:
                value = str(value)
            setattr(item, name, value)
        self._refresh_search(item)
        self._repository.save(item)
        self._repository.replace_photos(item, photos)
        self._media.prune(
            [url for url in previous if url not in [photo[0] for photo in photos]], current_user.id
        )
        return self.get(item.id)

    def remove(self, listing_id: int, current_user: CurrentUser) -> None:
        item = self._owned(listing_id, current_user)
        previous = item.image_urls
        self._repository.remove(item)
        self._media.prune(previous, current_user.id)

    def _get(self, listing_id: int) -> Listing:
        item = self._repository.get(listing_id)
        if item is None:
            raise ListingNotFoundException
        return item

    def _owned(self, listing_id: int, current_user: CurrentUser) -> Listing:
        item = self._get(listing_id)
        if item.owner_id != current_user.id:
            raise NotListingOwnerException
        return item

    @staticmethod
    def _refresh_search(item: Listing) -> None:
        item.search_text = f"{item.title} {item.city} {item.neighborhood}".casefold()
        item.pet_friendly = "Pet friendly" in item.tags
