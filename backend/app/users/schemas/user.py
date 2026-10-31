from __future__ import annotations

from pydantic import EmailStr, Field, field_validator
from pydantic_core import PydanticCustomError

from app.utils.image_location import ImageLocation
from app.utils.schemas import CamelCaseModel, CamelCaseResponseModel, TrimmedStr, UtcDatetime


class UserResponseSchema(CamelCaseResponseModel):
    id: int
    email: EmailStr
    display_name: str
    created_at: UtcDatetime
    age: int | None = None
    occupation: str = ""
    city: str = ""
    bio: str = ""
    avatar_url: str | None = None


class UserUpdateRequestSchema(CamelCaseModel):
    display_name: TrimmedStr | None = Field(default=None, min_length=2, max_length=60)
    age: int | None = Field(default=None, ge=18, le=100, strict=True)
    occupation: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=80)
    bio: str | None = Field(default=None, max_length=1000)
    avatar_url: ImageLocation | None = None

    @field_validator("display_name", "occupation", "city", "bio")
    @classmethod
    def validate_text(cls, value: str | None) -> str:
        if value is None:
            raise PydanticCustomError("null_not_allowed", "This field cannot be null")
        return value.strip()


class PublicUserSchema(CamelCaseResponseModel):
    id: int
    display_name: str
    age: int | None
    occupation: str
    city: str
    bio: str
    avatar_url: str | None
