from __future__ import annotations

from typing import Annotated

from fastapi import Depends, status

from app.auth.schemas.auth import CurrentUser
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.listings.schemas.listing import (
    ListingCreateRequestSchema,
    ListingFilters,
    ListingResponseSchema,
    ListingUpdateRequestSchema,
    get_listing_filters,
)
from app.listings.services.listing import IListingService
from app.utils.pagination import Page, PaginationParams, get_pagination_params

router = DBAPIRouter()


@router.get("", summary="Search rooms and roommates")
def list_listings(
    filters: Annotated[ListingFilters, Depends(get_listing_filters)],
    pagination: Annotated[PaginationParams, Depends(get_pagination_params)],
    service: Annotated[IListingService, Depends(get_di_entity(IListingService))],
) -> Page[ListingResponseSchema]:
    return service.list(filters=filters, pagination=pagination)


@router.get("/{listing_id}", summary="Read listing details")
def get_listing(
    listing_id: int, service: Annotated[IListingService, Depends(get_di_entity(IListingService))]
) -> ListingResponseSchema:
    return service.get(listing_id=listing_id)


@router.post("", status_code=status.HTTP_201_CREATED, summary="Publish a listing")
def create_listing(
    data: ListingCreateRequestSchema,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[IListingService, Depends(get_di_entity(IListingService))],
) -> ListingResponseSchema:
    return service.create(data=data, current_user=current_user)


@router.patch("/{listing_id}", summary="Edit my listing")
def update_listing(
    listing_id: int,
    data: ListingUpdateRequestSchema,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[IListingService, Depends(get_di_entity(IListingService))],
) -> ListingResponseSchema:
    return service.update(listing_id=listing_id, data=data, current_user=current_user)


@router.delete(
    "/{listing_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    summary="Delete my listing",
)
def delete_listing(
    listing_id: int,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[IListingService, Depends(get_di_entity(IListingService))],
) -> None:
    service.remove(listing_id=listing_id, current_user=current_user)
