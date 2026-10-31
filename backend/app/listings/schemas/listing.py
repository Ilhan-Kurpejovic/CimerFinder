from __future__ import annotations

from typing import Annotated, Literal

from fastapi import Query
from pydantic import Field, StringConstraints, field_validator
from pydantic_core import PydanticCustomError

from app.listings.models.listing import ListingKind, ListingStatus
from app.utils.image_location import ImageLocation
from app.utils.schemas import CamelCaseModel, CamelCaseResponseModel, TrimmedStr, UtcDatetime

Tag = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]


class ListingCreateRequestSchema(CamelCaseModel):
    kind: ListingKind
    status: ListingStatus = ListingStatus.ACTIVE
    title: TrimmedStr = Field(min_length=8, max_length=90)
    description: TrimmedStr = Field(min_length=40, max_length=3000)
    city: TrimmedStr = Field(min_length=2, max_length=80)
    neighborhood: TrimmedStr = Field(min_length=2, max_length=100)
    price: float = Field(ge=1, le=5000, allow_inf_nan=False)
    area: int = Field(ge=1, le=500, strict=True)
    roommates: int = Field(ge=1, le=10, strict=True)
    tags: list[Tag] = Field(default_factory=list, max_length=20)
    image_url: ImageLocation | None = None
    image_urls: list[ImageLocation] | None = Field(default=None, max_length=8)


class ListingUpdateRequestSchema(CamelCaseModel):
    kind: ListingKind | None = None
    status: ListingStatus | None = None
    title: TrimmedStr | None = Field(default=None, min_length=8, max_length=90)
    description: TrimmedStr | None = Field(default=None, min_length=40, max_length=3000)
    city: TrimmedStr | None = Field(default=None, min_length=2, max_length=80)
    neighborhood: TrimmedStr | None = Field(default=None, min_length=2, max_length=100)
    price: float | None = Field(default=None, ge=1, le=5000, allow_inf_nan=False)
    area: int | None = Field(default=None, ge=1, le=500, strict=True)
    roommates: int | None = Field(default=None, ge=1, le=10, strict=True)
    tags: list[Tag] | None = Field(default=None, max_length=20)
    image_url: ImageLocation | None = None
    image_urls: list[ImageLocation] | None = Field(default=None, max_length=8)

    @field_validator(
        "kind",
        "status",
        "title",
        "description",
        "city",
        "neighborhood",
        "price",
        "area",
        "roommates",
        "tags",
        "image_urls",
    )
    @classmethod
    def reject_null(cls, value: object) -> object:
        if value is None:
            raise PydanticCustomError("null_not_allowed", "This field cannot be null")
        return value


class ListingAuthorSchema(CamelCaseResponseModel):
    id: int
    display_name: str
    age: int | None
    occupation: str
    bio: str
    avatar_url: str | None


class ListingResponseSchema(CamelCaseResponseModel):
    id: int
    owner_id: int
    status: ListingStatus = ListingStatus.ACTIVE
    kind: ListingKind
    title: str
    description: str
    city: str
    neighborhood: str
    price: float
    area: int
    roommates: int
    tags: list[str]
    image_url: str | None
    image_urls: list[str] = Field(default_factory=list)
    created_at: UtcDatetime
    owner: ListingAuthorSchema


class ListingFilters(CamelCaseModel):
    search: str = ""
    city: str = ""
    kind: ListingKind | None = None
    max_price: float | None = None
    pet_friendly: bool = False
    sort: Literal["newest", "price"] = "newest"
    ids: list[int] | None = None


def get_listing_filters(
    search: Annotated[str, Query(max_length=200)] = "",
    city: Annotated[str, Query(max_length=80)] = "",
    kind: ListingKind | None = None,
    max_price: Annotated[
        float | None, Query(alias="maxPrice", ge=0, le=5000, allow_inf_nan=False)
    ] = None,
    pet_friendly: Annotated[bool, Query(alias="petFriendly")] = False,
    sort: Literal["newest", "price"] = "newest",
    ids: Annotated[list[int] | None, Query(max_length=100)] = None,
) -> ListingFilters:
    return ListingFilters(
        search=search.strip(),
        city=city.strip(),
        kind=kind,
        max_price=max_price,
        pet_friendly=pet_friendly,
        sort=sort,
        ids=ids,
    )
