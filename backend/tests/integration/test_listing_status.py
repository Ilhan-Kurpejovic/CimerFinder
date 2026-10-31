from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.integration


def test_status_hides_search_preserves_owner_and_can_reactivate(
    client: TestClient,
    publisher_headers: dict[str, str],
    other_auth_headers: dict[str, str],
    listing_id: int,
) -> None:
    url = f"/api/listings/{listing_id}"
    original = client.get(url).json()
    assert original["status"] == "active"
    for status in ("paused", "matched"):
        changed = client.patch(url, headers=publisher_headers, json={"status": status})
        assert changed.status_code == 200, changed.text
        assert changed.json()["status"] == status
        assert changed.json()["imageUrls"] == original["imageUrls"]
        assert client.get(url).json()["status"] == status
        assert client.get("/api/listings").json()["total"] == 0
        mine = client.get("/api/users/me/listings", headers=publisher_headers).json()
        assert mine["total"] == 1
        assert mine["items"][0]["status"] == status
        assert (
            client.patch(url, headers=other_auth_headers, json={"status": "active"}).status_code
            == 403
        )
    assert client.patch(url, json={"status": "active"}).status_code == 401
    for invalid in (None, "unknown"):
        assert (
            client.patch(url, headers=publisher_headers, json={"status": invalid}).status_code
            == 422
        )
    assert (
        client.patch(url, headers=publisher_headers, json={"status": "active"}).status_code == 200
    )
    assert client.get("/api/listings").json()["total"] == 1
    assert client.get(url).json()["createdAt"] == original["createdAt"]
