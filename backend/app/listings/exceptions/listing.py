from __future__ import annotations

from app.utils.exceptions import ForbiddenException, InvalidRequestException, NotFoundException


class ListingNotFoundException(NotFoundException):
    def __init__(self) -> None:
        super().__init__("Listing not found", "listing_not_found")


class NotListingOwnerException(ForbiddenException):
    def __init__(self) -> None:
        super().__init__("Only the owner can change this listing", "not_listing_owner")


class ProfileIncompleteException(InvalidRequestException):
    def __init__(self) -> None:
        super().__init__(
            "Complete your name, age and occupation before publishing", "profile_incomplete"
        )
