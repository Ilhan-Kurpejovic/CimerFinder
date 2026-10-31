from __future__ import annotations

from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.users.exceptions.user import UserNotFoundException
from app.users.schemas.user import UserResponseSchema
from tests.utils import create_current_user

pytestmark = pytest.mark.unit
HEADERS = {"Authorization": "Bearer token"}


def test_read_profile_passes_authenticated_identity(client: TestClient, user_service: Mock) -> None:
    user_service.get_profile.return_value = UserResponseSchema.model_validate(
        create_current_user(1)
    )
    response = client.get("/api/users/me", headers=HEADERS)
    assert response.status_code == 200
    assert response.json()["displayName"] == "Test User"
    user_service.get_profile.assert_called_once_with(user_id=1)


def test_patch_profile_passes_only_validated_fields(client: TestClient, user_service: Mock) -> None:
    user_service.update_profile.return_value = UserResponseSchema.model_validate(
        create_current_user(1)
    )
    response = client.patch(
        "/api/users/me",
        json={"city": "Podgorica", "bio": "Volim zajedničko kuvanje."},
        headers=HEADERS,
    )
    assert response.status_code == 200
    call = user_service.update_profile.call_args.kwargs
    assert call["user_id"] == 1
    assert call["data"].model_dump(exclude_unset=True) == {
        "city": "Podgorica",
        "bio": "Volim zajedničko kuvanje.",
    }


@pytest.mark.parametrize("method", ["GET", "PATCH"])
def test_profile_requires_authentication(
    client: TestClient, method: str, user_service: Mock
) -> None:
    response = client.request(method, "/api/users/me")
    assert response.status_code == 401
    user_service.get_profile.assert_not_called()
    user_service.update_profile.assert_not_called()


def test_profile_not_found_has_domain_error(client: TestClient, user_service: Mock) -> None:
    user_service.get_profile.side_effect = UserNotFoundException()
    response = client.get("/api/users/me", headers=HEADERS)
    assert response.status_code == 404
    assert response.json() == {"detail": "User not found", "code": "user_not_found"}


@pytest.mark.parametrize(
    "body",
    [
        {"age": 17},
        {"age": 24.5},
        {"displayName": " "},
        {"bio": None},
        {"email": "other@example.com"},
        {"id": 2},
        {"avatarUrl": "javascript:alert(1)"},
    ],
)
def test_profile_rejects_invalid_or_immutable_fields(
    client: TestClient, user_service: Mock, body: dict[str, object]
) -> None:
    response = client.patch("/api/users/me", json=body, headers=HEADERS)
    assert response.status_code == 422
    assert response.json()["code"] == "validation_error"
    user_service.update_profile.assert_not_called()
