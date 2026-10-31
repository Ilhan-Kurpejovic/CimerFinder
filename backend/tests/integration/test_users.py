from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.integration


def test_profile_is_persisted_and_visible_after_login(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    body = {
        "displayName": "Ana Petrović",
        "age": 24,
        "occupation": "Studentkinja",
        "city": "Podgorica",
        "bio": "Volim miran zajednički dom.",
        "avatarUrl": "https://example.com/ana.jpg",
    }
    response = client.patch("/api/users/me", headers=auth_headers, json=body)
    assert response.status_code == 200
    for key, value in body.items():
        assert response.json()[key] == value
    assert response.json()["email"] == "ana@example.com"
    login = client.post(
        "/api/auth/login", json={"email": "ANA@example.com", "password": "secret123"}
    )
    assert login.status_code == 200
    assert login.json()["user"]["displayName"] == body["displayName"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {login.json()['token']}"})
    assert me.json()["city"] == "Podgorica"
    assert "passwordHash" not in me.json()


def test_patch_is_partial_and_does_not_change_other_user(
    client: TestClient, auth_headers: dict[str, str], other_auth_headers: dict[str, str]
) -> None:
    before = client.get("/api/users/me", headers=auth_headers).json()
    response = client.patch("/api/users/me", headers=auth_headers, json={"bio": "Novi opis"})
    assert response.json()["displayName"] == before["displayName"]
    assert response.json()["bio"] == "Novi opis"
    other = client.get("/api/users/me", headers=other_auth_headers).json()
    assert other["bio"] == ""
    assert other["id"] != before["id"]


def test_nullable_profile_fields_can_be_cleared(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    assert (
        client.patch(
            "/api/users/me",
            headers=auth_headers,
            json={"age": 23, "avatarUrl": "https://example.com/avatar.jpg"},
        ).status_code
        == 200
    )
    response = client.patch(
        "/api/users/me", headers=auth_headers, json={"age": None, "avatarUrl": None}
    )
    assert response.status_code == 200
    assert response.json()["age"] is None
    assert response.json()["avatarUrl"] is None


@pytest.mark.parametrize(
    "body",
    [
        {"age": 17},
        {"age": 101},
        {"age": True},
        {"occupation": "a" * 101},
        {"city": "a" * 81},
        {"bio": "a" * 1001},
        {"displayName": None},
        {"email": "x@example.com"},
    ],
)
def test_invalid_patch_preserves_saved_profile(
    client: TestClient, auth_headers: dict[str, str], body: dict[str, object]
) -> None:
    before = client.get("/api/users/me", headers=auth_headers).json()
    response = client.patch("/api/users/me", headers=auth_headers, json=body)
    assert response.status_code == 422
    assert client.get("/api/users/me", headers=auth_headers).json() == before


@pytest.mark.parametrize("method", ["GET", "PATCH"])
def test_anonymous_profile_access_is_401(client: TestClient, method: str) -> None:
    response = client.request(method, "/api/users/me")
    assert response.status_code == 401
    assert response.headers["WWW-Authenticate"] == "Bearer"


def test_readiness_checks_database(client: TestClient) -> None:
    assert client.get("/ready").json() == {"status": "ok"}
