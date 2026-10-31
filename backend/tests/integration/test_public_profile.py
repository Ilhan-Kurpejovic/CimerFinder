from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.integration


def test_public_profile_shows_shared_information_without_private_fields(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    own = client.patch(
        "/api/users/me",
        headers=auth_headers,
        json={
            "displayName": "Ana Petrović",
            "age": 24,
            "occupation": "Student",
            "city": "Beograd",
            "bio": "Volim miran i uredan dom.",
        },
    ).json()
    response = client.get(f"/api/users/{own['id']}/public")
    assert response.status_code == 200
    public = response.json()
    assert set(public) == {"id", "displayName", "age", "occupation", "city", "bio", "avatarUrl"}
    assert public["displayName"] == "Ana Petrović"
    assert public["bio"] == "Volim miran i uredan dom."
    assert public["age"] == 24
    assert "email" not in public
    assert "passwordHash" not in public
    assert client.get("/api/users/me").status_code == 401
    assert client.get("/api/users/99999/public").status_code == 404
