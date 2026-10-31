from __future__ import annotations

from app.media.models.media import MediaPurpose
from app.utils.schemas import CamelCaseResponseModel


class MediaResponseSchema(CamelCaseResponseModel):
    id: int
    url: str
    purpose: MediaPurpose
    byte_size: int
    width: int
    height: int
