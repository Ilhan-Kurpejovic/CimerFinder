from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.integration
BASE = "/api/users/me/favorites"


def test_favorites_are_idempotent_private_and_filterable(
    client: TestClient,
    auth_headers: dict[str, str],
    other_auth_headers: dict[str, str],
    listing_id: int,
) -> None:
    assert client.get(BASE, headers=auth_headers).json() == []
    for _ in range(2):
        assert client.put(f"{BASE}/{listing_id}", headers=auth_headers).status_code == 204
    assert client.get(BASE, headers=auth_headers).json() == [listing_id]
    assert client.get(BASE, headers=other_auth_headers).json() == []
    assert client.delete(f"{BASE}/{listing_id}", headers=other_auth_headers).status_code == 204
    assert client.get(BASE, headers=auth_headers).json() == [listing_id]
    page = client.get(BASE + "/listings?size=1", headers=auth_headers)
    assert page.status_code == 200
    assert page.json()["total"] == 1
    assert page.json()["items"][0]["id"] == listing_id
    assert client.get(BASE + "/listings?maxPrice=1", headers=auth_headers).json()["total"] == 0
    assert client.get(BASE + "/listings", headers=other_auth_headers).json()["total"] == 0
    for _ in range(2):
        assert client.delete(f"{BASE}/{listing_id}", headers=auth_headers).status_code == 204
    assert client.get(BASE, headers=auth_headers).json() == []


def test_deleted_listing_cascades_favorites(
    client: TestClient,
    publisher_headers: dict[str, str],
    other_auth_headers: dict[str, str],
    listing_id: int,
) -> None:
    assert client.put(f"{BASE}/{listing_id}", headers=other_auth_headers).status_code == 204
    assert (
        client.delete(f"/api/listings/{listing_id}", headers=publisher_headers).status_code == 204
    )
    assert client.get(BASE, headers=other_auth_headers).json() == []
    assert client.put(f"{BASE}/{listing_id}", headers=other_auth_headers).status_code == 404
    assert client.delete(f"{BASE}/{listing_id}", headers=other_auth_headers).status_code == 204


def test_favorites_require_login(client: TestClient) -> None:
    assert client.get(BASE).status_code == 401
    assert client.get(BASE + "/listings").status_code == 401
    assert client.put(BASE + "/1").status_code == 401
    assert client.delete(BASE + "/1").status_code == 401


def test_failed_save_commit_is_rolled_back(
    client: TestClient, auth_headers: dict[str, str], listing_id: int
) -> None:
    from unittest.mock import patch

    from sqlalchemy.orm import Session

    with patch.object(Session, "commit", side_effect=RuntimeError), pytest.raises(RuntimeError):
        client.put(f"{BASE}/{listing_id}", headers=auth_headers)
    assert client.get(BASE, headers=auth_headers).json() == []
