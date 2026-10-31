from __future__ import annotations

from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.users.schemas.user import PublicUserSchema

pytestmark = pytest.mark.unit


def test_public_profile_uses_dedicated_public_schema(
    client: TestClient, user_service: Mock
) -> None:
    user_service.get_public_profile.return_value = PublicUserSchema(
        id=2, display_name="Marko", age=None, occupation="", city="", bio="", avatar_url=None
    )
    response = client.get("/api/users/2/public")
    assert response.status_code == 200
    assert response.json()["id"] == 2
    assert "email" not in response.json()
    user_service.get_public_profile.assert_called_once_with(2)
