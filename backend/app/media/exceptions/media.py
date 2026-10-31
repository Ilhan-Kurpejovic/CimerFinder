from __future__ import annotations

from app.utils.exceptions import (
    ConflictException,
    ForbiddenException,
    NotFoundException,
    PayloadTooLargeException,
    ServerException,
    UnprocessableException,
    UnsupportedMediaException,
)


class MediaNotFoundException(NotFoundException):
    def __init__(self) -> None:
        super().__init__("Image not found", "media_not_found")


class MediaNotOwnerException(ForbiddenException):
    def __init__(self) -> None:
        super().__init__("Only the image owner can use or delete it", "not_media_owner")


class MediaInUseException(ConflictException):
    def __init__(self) -> None:
        super().__init__("This image is still used by a profile or listing", "media_in_use")


class InvalidImageException(UnprocessableException):
    def __init__(self) -> None:
        super().__init__("Invalid or corrupted image", "invalid_image")


class InvalidMediaPurposeException(UnprocessableException):
    def __init__(self) -> None:
        super().__init__("Image purpose does not match", "invalid_media_purpose")


class ImageTooLargeException(PayloadTooLargeException):
    def __init__(self) -> None:
        super().__init__("Image exceeds the upload size limit", "image_too_large")


class UnsupportedImageException(UnsupportedMediaException):
    def __init__(self) -> None:
        super().__init__("Only JPEG, PNG and WebP photos are supported", "unsupported_image")


class ImageStorageException(ServerException):
    def __init__(self) -> None:
        super().__init__("Image storage is unavailable", "image_storage_error")
