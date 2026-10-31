from __future__ import annotations

from typing import Annotated

from fastapi import Depends, File, Form, UploadFile, status
from fastapi.responses import FileResponse

from app.auth.schemas.auth import CurrentUser
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.media.models.media import MediaPurpose
from app.media.schemas.media import MediaResponseSchema
from app.media.services.media import IMediaService

router = DBAPIRouter()


@router.post("", status_code=status.HTTP_201_CREATED, summary="Upload a photo")
def upload_photo(
    file: Annotated[UploadFile, File()],
    purpose: Annotated[MediaPurpose, Form()],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[IMediaService, Depends(get_di_entity(IMediaService))],
) -> MediaResponseSchema:
    return service.upload(file=file, purpose=purpose, user_id=current_user.id)


@router.get("/{key}", response_model=None, summary="Read a public image")
def get_photo(
    key: str, service: Annotated[IMediaService, Depends(get_di_entity(IMediaService))]
) -> FileResponse:
    return FileResponse(
        service.file(key),
        media_type="image/webp",
        headers={
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    )


@router.delete(
    "/{media_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    summary="Delete my unused image",
)
def delete_photo(
    media_id: int,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    service: Annotated[IMediaService, Depends(get_di_entity(IMediaService))],
) -> None:
    service.remove(media_id=media_id, user_id=current_user.id)
