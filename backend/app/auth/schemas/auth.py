from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic_core import PydanticCustomError

from app.users.schemas.user import UserResponseSchema
from app.utils.schemas import CamelCaseModel, TrimmedStr


class CredentialsSchema(CamelCaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise PydanticCustomError(
                "password_bytes", "Password must contain at most 72 UTF-8 bytes"
            )
        return value


class RegisterRequestSchema(CredentialsSchema):
    password: str = Field(min_length=8, max_length=72)
    display_name: TrimmedStr = Field(min_length=2, max_length=60)


class LoginRequestSchema(CredentialsSchema):
    pass


class AuthenticationResponseSchema(CamelCaseModel):
    token: str
    user: UserResponseSchema


class CurrentUser(UserResponseSchema):
    """Identity loaded from a verified token and the database for each request."""


class TokenPayload(BaseModel):
    sub: str = Field(pattern=r"^[1-9][0-9]*$")
    exp: int
    iat: int
