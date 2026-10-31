from __future__ import annotations

import warnings
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Protocol
from uuid import uuid4

from PIL import Image, ImageOps, UnidentifiedImageError

from app.config.settings import Settings
from app.media.exceptions.media import (
    ImageStorageException,
    InvalidImageException,
    UnsupportedImageException,
)
from app.utils.di import inject
from app.utils.image_location import MEDIA_KEY


@dataclass
class EncodedImage:
    data: bytes
    width: int
    height: int


class IImageStorage(Protocol):
    def encode(self, data: bytes, content_type: str) -> EncodedImage: ...
    def write(self, image: EncodedImage) -> str: ...
    def path(self, key: str) -> Path: ...
    def remove(self, key: str) -> None: ...


@inject(alias=IImageStorage)
class ImageStorage(IImageStorage):
    def __init__(self, settings: Settings) -> None:
        self._root = Path(settings.UPLOAD_DIR).resolve()

    def encode(self, data: bytes, content_type: str) -> EncodedImage:
        expected = {"image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WEBP"}
        if content_type not in expected:
            raise UnsupportedImageException
        try:
            with warnings.catch_warnings():
                warnings.simplefilter("error", Image.DecompressionBombWarning)
                with Image.open(BytesIO(data), formats=["JPEG", "PNG", "WEBP"]) as image:
                    if image.format != expected[content_type]:
                        raise UnsupportedImageException
                    if image.width * image.height > 25_000_000 or getattr(
                        image, "is_animated", False
                    ):
                        raise InvalidImageException
                    image.verify()
                with Image.open(BytesIO(data), formats=["JPEG", "PNG", "WEBP"]) as image:
                    image.load()
                    with ImageOps.exif_transpose(image) as oriented:
                        oriented.thumbnail((2000, 2000), Image.Resampling.LANCZOS)
                        mode = "RGBA" if "A" in oriented.getbands() else "RGB"
                        with oriented.convert(mode) as clean:
                            clean.info.clear()
                            output = BytesIO()
                            clean.save(output, format="WEBP", quality=85, method=4)
                            return EncodedImage(
                                data=output.getvalue(), width=clean.width, height=clean.height
                            )
        except (
            UnidentifiedImageError,
            OSError,
            ValueError,
            Image.DecompressionBombError,
            Image.DecompressionBombWarning,
        ) as error:
            raise InvalidImageException from error

    def path(self, key: str) -> Path:
        if not MEDIA_KEY.fullmatch(key):
            raise ImageStorageException
        result = (self._root / key).resolve()
        if result.parent != self._root:
            raise ImageStorageException
        return result

    def write(self, image: EncodedImage) -> str:
        key = uuid4().hex + ".webp"
        try:
            self._root.mkdir(parents=True, exist_ok=True)
            with self.path(key).open("xb") as output:
                output.write(image.data)
        except OSError as error:
            self.path(key).unlink(missing_ok=True)
            raise ImageStorageException from error
        return key

    def remove(self, key: str) -> None:
        self.path(key).unlink(missing_ok=True)
