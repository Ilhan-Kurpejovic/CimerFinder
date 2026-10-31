from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from app.auth.schemas.auth import CurrentUser
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.favorites.services.favorite import IFavoriteService
from app.listings.schemas.listing import ListingFilters, ListingResponseSchema, get_listing_filters
from app.listings.services.listing import IListingService
from app.utils.pagination import Page, PaginationParams, get_pagination_params

router = DBAPIRouter()


@router.get("", summary="Read my favorite listing IDs")
def get_favorites(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[IFavoriteService, Depends(get_di_entity(IFavoriteService))],
) -> list[int]:
    return service.ids(current_user.id)


@router.get("/listings", summary="Read my favorite listings")
def get_favorite_listings(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[IFavoriteService, Depends(get_di_entity(IFavoriteService))],
    listings: Annotated[IListingService, Depends(get_di_entity(IListingService))],
    filters: Annotated[ListingFilters, Depends(get_listing_filters)],
    pagination: Annotated[PaginationParams, Depends(get_pagination_params)],
) -> Page[ListingResponseSchema]:
    ids = service.ids(current_user.id)
    if filters.ids is not None:
        ids = list(set(ids).intersection(filters.ids))
    return listings.list(filters.model_copy(update={"ids": ids}), pagination)


@router.put("/{listing_id}", status_code=204, response_model=None, summary="Save a listing")
def save_favorite(
    listing_id: int,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[IFavoriteService, Depends(get_di_entity(IFavoriteService))],
) -> None:
    service.add(current_user.id, listing_id)


@router.delete("/{listing_id}", status_code=204, response_model=None, summary="Unsave a listing")
def remove_favorite(
    listing_id: int,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[IFavoriteService, Depends(get_di_entity(IFavoriteService))],
) -> None:
    service.remove(current_user.id, listing_id)
