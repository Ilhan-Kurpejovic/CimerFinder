from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.integration


def test_create_read_edit_and_delete(
    client: TestClient, publisher_headers: dict[str, str], listing_body: dict[str, object]
) -> None:
    created = client.post("/api/listings", headers=publisher_headers, json=listing_body)
    assert created.status_code == 201, created.text
    item = created.json()
    assert item["owner"]["displayName"] == "ana"
    assert "email" not in item["owner"]
    assert "passwordHash" not in item["owner"]
    fetched = client.get(f"/api/listings/{item['id']}")
    assert fetched.json() == item
    edited = client.patch(
        f"/api/listings/{item['id']}",
        headers=publisher_headers,
        json={
            "price": 199,
            "title": "Udobna soba u centru",
            "imageUrl": "https://example.com/new-room.jpg",
        },
    )
    assert edited.status_code == 200
    assert edited.json()["id"] == item["id"]
    assert edited.json()["createdAt"] == item["createdAt"]
    assert edited.json()["imageUrl"] == "https://example.com/new-room.jpg"
    assert client.get("/api/listings?search=Udobna").json()["total"] == 1
    deleted = client.delete(f"/api/listings/{item['id']}", headers=publisher_headers)
    assert deleted.status_code == 204
    assert deleted.content == b""
    assert client.get(f"/api/listings/{item['id']}").status_code == 404


def test_filters_pagination_and_personal_listings(
    client: TestClient,
    publisher_headers: dict[str, str],
    other_auth_headers: dict[str, str],
    listing_body: dict[str, object],
) -> None:
    for price, city in [(300, "Beograd"), (200, "Beograd"), (150, "Novi Sad")]:
        assert (
            client.post(
                "/api/listings",
                headers=publisher_headers,
                json={**listing_body, "price": price, "city": city},
            ).status_code
            == 201
        )
    page = client.get(
        "/api/listings?city=Beograd&maxPrice=250&kind=room&petFriendly=true&size=1"
    ).json()
    assert page["total"] == 1
    assert page["items"][0]["price"] == 200
    assert page["pages"] == 1
    sorted_page = client.get("/api/listings?sort=price&size=1&page=2").json()
    assert sorted_page["total"] == 3
    assert sorted_page["pages"] == 3
    assert sorted_page["items"][0]["price"] == 200
    mine = client.get("/api/users/me/listings?size=2", headers=publisher_headers).json()
    assert mine["total"] == 3
    assert len(mine["items"]) == 2
    assert client.get("/api/users/me/listings", headers=other_auth_headers).json()["total"] == 0
    assert client.get("/api/users/me/listings").status_code == 401


def test_search_handles_unicode_and_literal_wildcards(
    client: TestClient, publisher_headers: dict[str, str], listing_body: dict[str, object]
) -> None:
    created = client.post(
        "/api/listings",
        headers=publisher_headers,
        json={**listing_body, "title": "Svijetla soba u Nikšiću"},
    )
    assert created.status_code == 201
    assert client.get("/api/listings?search=NIKŠIĆU").json()["total"] == 1
    assert client.get("/api/listings?search=%25").json()["total"] == 0
    assert client.get(f"/api/listings?ids={created.json()['id']}").json()["total"] == 1


@pytest.mark.parametrize("method", ["PATCH", "DELETE"])
def test_other_user_cannot_change_listing(
    client: TestClient, listing_id: int, other_auth_headers: dict[str, str], method: str
) -> None:
    response = client.request(
        method,
        f"/api/listings/{listing_id}",
        headers=other_auth_headers,
        json={"price": 50} if method == "PATCH" else None,
    )
    assert response.status_code == 403
    assert response.json()["code"] == "not_listing_owner"
    assert client.get(f"/api/listings/{listing_id}").status_code == 200


@pytest.mark.parametrize(
    ("method", "path"),
    [("POST", "/api/listings"), ("PATCH", "/api/listings/1"), ("DELETE", "/api/listings/1")],
)
def test_listing_writes_require_authentication(client: TestClient, method: str, path: str) -> None:
    assert client.request(method, path).status_code == 401


@pytest.mark.parametrize("method", ["GET", "PATCH", "DELETE"])
def test_missing_listing_is_404(
    client: TestClient, publisher_headers: dict[str, str], method: str
) -> None:
    response = client.request(
        method,
        "/api/listings/999999",
        headers=publisher_headers,
        json={} if method == "PATCH" else None,
    )
    assert response.status_code == 404
    assert response.json()["code"] == "listing_not_found"


@pytest.mark.parametrize(
    "changes",
    [
        {"price": -1},
        {"title": "short"},
        {"description": "short"},
        {"kind": "games"},
        {"roommates": 0},
        {"area": 0},
        {"ownerId": 2},
        {"imageUrl": "data:image/png;base64,abc"},
        {"tags": ["x" * 51]},
    ],
)
def test_create_rejects_invalid_data(
    client: TestClient,
    publisher_headers: dict[str, str],
    listing_body: dict[str, object],
    changes: dict[str, object],
) -> None:
    response = client.post(
        "/api/listings", headers=publisher_headers, json={**listing_body, **changes}
    )
    assert response.status_code == 422
    assert client.get("/api/listings").json()["total"] == 0


def test_failed_patch_is_atomic_and_owner_cannot_be_forged(
    client: TestClient, publisher_headers: dict[str, str], listing_id: int
) -> None:
    before = client.get(f"/api/listings/{listing_id}").json()
    for body in [{"price": None}, {"ownerId": 2}, {"city": None}]:
        assert (
            client.patch(
                f"/api/listings/{listing_id}", headers=publisher_headers, json=body
            ).status_code
            == 422
        )
        assert client.get(f"/api/listings/{listing_id}").json() == before


def test_author_updates_follow_profile_and_room_photo_stays(
    client: TestClient, publisher_headers: dict[str, str], listing_id: int
) -> None:
    before = client.get(f"/api/listings/{listing_id}").json()
    assert (
        client.patch(
            "/api/users/me",
            headers=publisher_headers,
            json={
                "displayName": "Novo ime",
                "avatarUrl": "https://example.com/portrait.jpg",
                "bio": "Novi opis profila",
            },
        ).status_code
        == 200
    )
    after = client.get(f"/api/listings/{listing_id}").json()
    assert after["owner"]["displayName"] == "Novo ime"
    assert after["owner"]["avatarUrl"] == "https://example.com/portrait.jpg"
    assert after["imageUrl"] == before["imageUrl"]


def test_incomplete_profile_cannot_publish(
    client: TestClient, auth_headers: dict[str, str], listing_body: dict[str, object]
) -> None:
    response = client.post("/api/listings", headers=auth_headers, json=listing_body)
    assert response.status_code == 400
    assert response.json()["code"] == "profile_incomplete"


@pytest.mark.parametrize("query", ["size=0", "page=0", "maxPrice=-1", "kind=games", "sort=unknown"])
def test_invalid_filters_are_422(client: TestClient, query: str) -> None:
    assert client.get("/api/listings?" + query).status_code == 422


def test_deleted_listing_id_is_not_reused(
    client: TestClient, publisher_headers: dict[str, str], listing_body: dict[str, object]
) -> None:
    first = client.post("/api/listings", headers=publisher_headers, json=listing_body).json()
    assert (
        client.delete(f"/api/listings/{first['id']}", headers=publisher_headers).status_code == 204
    )
    second = client.post("/api/listings", headers=publisher_headers, json=listing_body).json()
    assert second["id"] > first["id"]
