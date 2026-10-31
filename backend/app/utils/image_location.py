from __future__ import annotations

import re
from typing import Annotated
from urllib.parse import urlsplit

from pydantic import BeforeValidator, Field, HttpUrl, TypeAdapter
from pydantic_core import PydanticCustomError

MEDIA_KEY = re.compile(r"^[a-f0-9]{32}\.webp$")
http_url = TypeAdapter(HttpUrl)


def local_media_key(url: str) -> str | None:
    path = urlsplit(url).path
    if path.startswith("/api/media/"):
        key = path.removeprefix("/api/media/")
        return key if MEDIA_KEY.fullmatch(key) else None
    return None


def validate_image_location(value: object) -> str:
    if not isinstance(value, str):
        raise PydanticCustomError("invalid_image_url", "Expected an image URL")
    if value.startswith("/api/media/"):
        if local_media_key(value) is None:
            raise PydanticCustomError("invalid_image_url", "Invalid media image path")
        if "?" in value or "#" in value:
            raise PydanticCustomError("invalid_image_url", "Expected a canonical media URL")
        return value
    return str(http_url.validate_python(value))


ImageLocation = Annotated[str, BeforeValidator(validate_image_location), Field(max_length=500)]
