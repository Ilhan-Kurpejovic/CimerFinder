from __future__ import annotations

from collections.abc import Generator
from unittest.mock import Mock, create_autospec

import pytest
from fastapi.testclient import TestClient

from app.favorites.services.favorite import IFavoriteService
from app.utils.di import add_to_di_container, remove_from_di_container

pytestmark = pytest.mark.unit
HEADERS = {"Authorization": "Bearer token"}
BASE = "/api/users/me/favorites"


@pytest.fixture
def favorites() -> Generator[Mock]:
    service = create_autospec(IFavoriteService, instance=True)
    service.ids.return_value = [42]
    add_to_di_container(IFavoriteService, service)
    yield service
    remove_from_di_container(IFavoriteService)


def test_read_uses_token_identity(client: TestClient, favorites: Mock) -> None:
    assert client.get(BASE, headers=HEADERS).json() == [42]
    favorites.ids.assert_called_once_with(1)


def test_save_and_remove_use_token_identity(client: TestClient, favorites: Mock) -> None:
    assert client.put(BASE + "/42", headers=HEADERS).status_code == 204
    favorites.add.assert_called_once_with(1, 42)
    assert client.delete(BASE + "/42", headers=HEADERS).status_code == 204
    favorites.remove.assert_called_once_with(1, 42)


def test_favorite_page_intersects_ids(
    client: TestClient, favorites: Mock, listing_service: Mock
) -> None:
    from app.utils.pagination import Page

    listing_service.list.return_value = Page(items=[], total=0, pages=0)
    response = client.get(BASE + "/listings?ids=99", headers=HEADERS)
    assert response.status_code == 200
    assert listing_service.list.call_args.args[0].ids == []
    favorites.ids.assert_called_once_with(1)
