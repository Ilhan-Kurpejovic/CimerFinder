from __future__ import annotations

from collections.abc import Generator
from pathlib import Path
from unittest.mock import Mock, create_autospec

import pytest
from fastapi.testclient import TestClient

from app.media.models.media import MediaPurpose
from app.media.schemas.media import MediaResponseSchema
from app.media.services.media import IMediaService
from app.utils.di import add_to_di_container, remove_from_di_container

pytestmark = pytest.mark.unit
HEADERS = {"Authorization": "Bearer token"}


@pytest.fixture
def media_service() -> Generator[Mock]:
    service = create_autospec(IMediaService, instance=True)
    add_to_di_container(IMediaService, service)
    yield service
    remove_from_di_container(IMediaService)


def test_upload_passes_authenticated_owner_and_purpose(
    client: TestClient, media_service: Mock
) -> None:
    media_service.upload.return_value = MediaResponseSchema(
        id=1,
        url="/api/media/" + "a" * 32 + ".webp",
        purpose=MediaPurpose.AVATAR,
        byte_size=100,
        width=10,
        height=10,
    )
    response = client.post(
        "/api/media",
        headers=HEADERS,
        data={"purpose": "avatar"},
        files={"file": ("photo.png", b"fixture", "image/png")},
    )
    assert response.status_code == 201
    assert media_service.upload.call_args.kwargs["user_id"] == 1
    assert media_service.upload.call_args.kwargs["purpose"] == MediaPurpose.AVATAR


def test_anonymous_upload_and_delete_are_401(client: TestClient, media_service: Mock) -> None:
    assert (
        client.post(
            "/api/media", data={"purpose": "avatar"}, files={"file": ("p.png", b"x", "image/png")}
        ).status_code
        == 401
    )
    assert client.delete("/api/media/1").status_code == 401
    media_service.upload.assert_not_called()
    media_service.remove.assert_not_called()


def test_delete_has_no_body(client: TestClient, media_service: Mock) -> None:
    response = client.delete("/api/media/1", headers=HEADERS)
    assert response.status_code == 204
    assert not response.content
    media_service.remove.assert_called_once_with(media_id=1, user_id=1)


def test_public_file_response(client: TestClient, media_service: Mock, tmp_path: Path) -> None:
    key = "a" * 32 + ".webp"
    image = tmp_path / key
    image.write_bytes(b"processed-image-fixture")
    media_service.file.return_value = image
    response = client.get("/api/media/" + key)
    assert response.status_code == 200
    assert response.content == b"processed-image-fixture"
    assert response.headers["content-type"] == "image/webp"
    assert response.headers["x-content-type-options"] == "nosniff"
    media_service.file.assert_called_once_with(key)
