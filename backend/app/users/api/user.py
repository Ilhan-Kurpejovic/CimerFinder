from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from app.auth.schemas.auth import CurrentUser
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.listings.schemas.listing import ListingFilters, ListingResponseSchema, get_listing_filters
from app.listings.services.listing import IListingService
from app.users.schemas.user import PublicUserSchema, UserResponseSchema, UserUpdateRequestSchema
from app.users.services.user import IUserService
from app.utils.pagination import Page, PaginationParams, get_pagination_params

router = DBAPIRouter()


@router.get("/me", summary="Read my profile")
def get_my_profile(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[IUserService, Depends(get_di_entity(IUserService))],
) -> UserResponseSchema:
    return service.get_profile(user_id=current_user.id)


@router.patch("/me", summary="Update my profile")
def update_my_profile(
    data: UserUpdateRequestSchema,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[IUserService, Depends(get_di_entity(IUserService))],
) -> UserResponseSchema:
    return service.update_profile(user_id=current_user.id, data=data)


@router.get("/me/listings", summary="Read my listings")
def get_my_listings(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    filters: Annotated[ListingFilters, Depends(get_listing_filters)],
    pagination: Annotated[PaginationParams, Depends(get_pagination_params)],
    service: Annotated[IListingService, Depends(get_di_entity(IListingService))],
) -> Page[ListingResponseSchema]:
    return service.list(filters=filters, pagination=pagination, owner_id=current_user.id)


@router.get("/{user_id}/public", summary="Read a public user profile")
def get_public_profile(
    user_id: int, service: Annotated[IUserService, Depends(get_di_entity(IUserService))]
) -> PublicUserSchema:
    return service.get_public_profile(user_id)
