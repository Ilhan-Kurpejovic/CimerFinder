from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import cast
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config.settings import Settings
from app.database.session_factory import ISessionFactory
from app.media.models.media import Media
from app.utils.di import get_from_di_container

pytestmark = pytest.mark.integration


def photo_bytes(format: str = "PNG", width: int = 24, height: int = 16) -> bytes:
    output = BytesIO()
    with Image.new("RGB", (width, height), "purple") as image:
        image.save(output, format=format)
    return output.getvalue()


def upload(
    client: TestClient, headers: dict[str, str], purpose: str = "listing"
) -> dict[str, object]:
    response = client.post(
        "/api/media",
        headers=headers,
        data={"purpose": purpose},
        files={"file": ("../../private.png", photo_bytes(), "image/png")},
    )
    assert response.status_code == 201, response.text
    return cast(dict[str, object], response.json())


def file_path(asset: dict[str, object]) -> Path:
    settings = get_from_di_container(Settings)
    return Path(settings.UPLOAD_DIR) / str(asset["url"]).rsplit("/", 1)[1]


def test_upload_is_encoded_served_and_can_be_discarded(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    asset = upload(client, auth_headers)
    assert str(asset["url"]).startswith("/api/media/")
    assert "private" not in str(asset["url"])
    assert file_path(asset).is_file()
    response = client.get(str(asset["url"]))
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/webp"
    assert response.headers["x-content-type-options"] == "nosniff"
    with Image.open(BytesIO(response.content)) as image:
        assert image.format == "WEBP"
        assert image.size == (24, 16)
    assert client.delete(f"/api/media/{asset['id']}", headers=auth_headers).status_code == 204
    assert not file_path(asset).exists()
    assert client.get(str(asset["url"])).status_code == 404


@pytest.mark.parametrize(
    ("format", "mime"), [("JPEG", "image/jpeg"), ("PNG", "image/png"), ("WEBP", "image/webp")]
)
def test_supported_formats(
    client: TestClient, auth_headers: dict[str, str], format: str, mime: str
) -> None:
    response = client.post(
        "/api/media",
        headers=auth_headers,
        data={"purpose": "avatar"},
        files={"file": ("photo.bin", photo_bytes(format), mime)},
    )
    assert response.status_code == 201


def test_upload_requires_auth(client: TestClient) -> None:
    assert (
        client.post(
            "/api/media",
            data={"purpose": "avatar"},
            files={"file": ("photo.png", photo_bytes(), "image/png")},
        ).status_code
        == 401
    )


@pytest.mark.parametrize(
    ("data", "mime", "status"),
    [
        (b"<svg onload='alert(1)'/>", "image/svg+xml", 415),
        (b"not an image", "image/png", 422),
        (b"", "image/jpeg", 422),
        (photo_bytes(), "image/jpeg", 415),
        (photo_bytes()[:30], "image/png", 422),
    ],
)
def test_invalid_images_do_not_create_metadata(
    client: TestClient, auth_headers: dict[str, str], data: bytes, mime: str, status: int
) -> None:
    response = client.post(
        "/api/media",
        headers=auth_headers,
        data={"purpose": "listing"},
        files={"file": ("image.png", data, mime)},
    )
    assert response.status_code == status
    factory = get_from_di_container(ISessionFactory)
    with factory() as session:
        assert session.scalar(select(func.count(Media.id))) == 0


def test_oversized_body_and_file_are_rejected(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post(
        "/api/media",
        headers=auth_headers,
        data={"purpose": "listing"},
        files={"file": ("huge.png", b"x" * (5 * 1024 * 1024 + 1), "image/png")},
    )
    assert response.status_code == 413
    assert response.json()["code"] == "image_too_large"
    response = client.post(
        "/api/media",
        headers={**auth_headers, "Content-Type": "application/octet-stream"},
        content=b"x" * (5 * 1024 * 1024 + 65537),
    )
    assert response.status_code == 413


def test_resize_and_exif_are_normalized(client: TestClient, auth_headers: dict[str, str]) -> None:
    data = BytesIO()
    with Image.new("RGB", (2100, 40), "blue") as image:
        exif = Image.Exif()
        exif[274] = 6
        exif[315] = "Private artist metadata"
        image.save(data, format="JPEG", exif=exif)
    response = client.post(
        "/api/media",
        headers=auth_headers,
        data={"purpose": "avatar"},
        files={"file": ("portrait.jpg", data.getvalue(), "image/jpeg")},
    )
    assert response.status_code == 201
    result = client.get(response.json()["url"])
    with Image.open(BytesIO(result.content)) as image:
        assert image.height == 2000
        assert image.width < image.height
        assert not image.getexif()


def test_ownership_and_purpose_are_enforced(
    client: TestClient,
    auth_headers: dict[str, str],
    other_auth_headers: dict[str, str],
    publisher_headers: dict[str, str],
    listing_body: dict[str, object],
) -> None:
    other = upload(client, other_auth_headers, "avatar")
    assert (
        client.patch(
            "/api/users/me", headers=auth_headers, json={"avatarUrl": other["url"]}
        ).status_code
        == 403
    )
    assert (
        client.patch(
            "/api/users/me",
            headers=auth_headers,
            json={"avatarUrl": "https://example.com" + str(other["url"])},
        ).status_code
        == 403
    )
    assert client.delete(f"/api/media/{other['id']}", headers=auth_headers).status_code == 403
    own_avatar = upload(client, auth_headers, "avatar")
    assert (
        client.post(
            "/api/listings",
            headers=publisher_headers,
            json={**listing_body, "imageUrls": [own_avatar["url"]]},
        ).status_code
        == 422
    )
    assert (
        client.patch(
            "/api/users/me", headers=auth_headers, json={"avatarUrl": "/api/media/../secret.png"}
        ).status_code
        == 422
    )


def test_avatar_replacement_and_removal_prune_old_bytes(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    first = upload(client, auth_headers, "avatar")
    second = upload(client, auth_headers, "avatar")
    assert (
        client.patch(
            "/api/users/me", headers=auth_headers, json={"avatarUrl": first["url"]}
        ).status_code
        == 200
    )
    assert client.delete(f"/api/media/{first['id']}", headers=auth_headers).status_code == 409
    assert (
        client.patch(
            "/api/users/me", headers=auth_headers, json={"avatarUrl": second["url"]}
        ).status_code
        == 200
    )
    assert client.get(str(first["url"])).status_code == 404
    assert not file_path(first).exists()
    assert client.get(str(second["url"])).status_code == 200
    assert (
        client.patch("/api/users/me", headers=auth_headers, json={"avatarUrl": None}).status_code
        == 200
    )
    assert not file_path(second).exists()


def test_gallery_reorder_removal_and_shared_references(
    client: TestClient, publisher_headers: dict[str, str], listing_body: dict[str, object]
) -> None:
    first = upload(client, publisher_headers)
    second = upload(client, publisher_headers)
    response = client.post(
        "/api/listings",
        headers=publisher_headers,
        json={**listing_body, "imageUrls": [first["url"], second["url"]]},
    )
    assert response.status_code == 201, response.text
    listing_id = response.json()["id"]
    assert response.json()["imageUrls"] == [first["url"], second["url"]]
    reordered = client.patch(
        f"/api/listings/{listing_id}",
        headers=publisher_headers,
        json={"imageUrls": [second["url"], first["url"]]},
    )
    assert reordered.status_code == 200, reordered.text
    assert reordered.json()["imageUrl"] == second["url"]
    shared = client.post(
        "/api/listings",
        headers=publisher_headers,
        json={**listing_body, "imageUrls": [first["url"]]},
    ).json()["id"]
    assert (
        client.patch(
            f"/api/listings/{listing_id}",
            headers=publisher_headers,
            json={"imageUrls": [second["url"]]},
        ).status_code
        == 200
    )
    assert client.get(str(first["url"])).status_code == 200
    assert client.delete(f"/api/listings/{shared}", headers=publisher_headers).status_code == 204
    assert not file_path(first).exists()
    assert (
        client.delete(f"/api/listings/{listing_id}", headers=publisher_headers).status_code == 204
    )
    assert not file_path(second).exists()


def test_gallery_limit_and_nonexistent_assets(
    client: TestClient, publisher_headers: dict[str, str], listing_body: dict[str, object]
) -> None:
    assert (
        client.post(
            "/api/listings",
            headers=publisher_headers,
            json={**listing_body, "imageUrls": ["https://example.com/a.jpg"] * 9},
        ).status_code
        == 422
    )
    assert (
        client.post(
            "/api/listings",
            headers=publisher_headers,
            json={**listing_body, "imageUrls": ["/api/media/" + "a" * 32 + ".webp"]},
        ).status_code
        == 404
    )


def test_failed_upload_commit_removes_new_file(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    root = Path(get_from_di_container(Settings).UPLOAD_DIR)
    before = set(root.glob("*.webp"))
    with patch.object(Session, "commit", side_effect=RuntimeError), pytest.raises(RuntimeError):
        upload(client, auth_headers)
    assert set(root.glob("*.webp")) == before


def test_failed_avatar_commit_preserves_old_file_and_profile(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    first = upload(client, auth_headers, "avatar")
    second = upload(client, auth_headers, "avatar")
    assert (
        client.patch(
            "/api/users/me", headers=auth_headers, json={"avatarUrl": first["url"]}
        ).status_code
        == 200
    )
    with patch.object(Session, "commit", side_effect=RuntimeError), pytest.raises(RuntimeError):
        client.patch("/api/users/me", headers=auth_headers, json={"avatarUrl": second["url"]})
    assert client.get("/api/users/me", headers=auth_headers).json()["avatarUrl"] == first["url"]
    assert file_path(first).exists()
    assert file_path(second).exists()
