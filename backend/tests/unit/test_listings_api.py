from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.listings.exceptions.listing import ListingNotFoundException, NotListingOwnerException
from app.listings.models.listing import ListingKind
from app.listings.schemas.listing import ListingAuthorSchema, ListingResponseSchema
from app.utils.pagination import Page

pytestmark = pytest.mark.unit
HEADERS = {"Authorization": "Bearer token"}
BODY = {
    "kind": "room",
    "title": "Svijetla soba u centru",
    "description": "Prijatna soba za zajednički život u mirnom i urednom stanu.",
    "city": "Beograd",
    "neighborhood": "Centar",
    "price": 250,
    "area": 18,
    "roommates": 1,
    "tags": [],
}


def sample() -> ListingResponseSchema:
    return ListingResponseSchema(
        id=1,
        owner_id=1,
        kind=ListingKind.ROOM,
        title="Svijetla soba u centru",
        description=str(BODY["description"]),
        city="Beograd",
        neighborhood="Centar",
        price=250,
        area=18,
        roommates=1,
        tags=[],
        image_url=None,
        created_at=datetime(2026, 1, 1, tzinfo=UTC),
        owner=ListingAuthorSchema(
            id=1, display_name="Ana", age=24, occupation="Student", bio="", avatar_url=None
        ),
    )


def test_list_passes_filters_and_pagination(client: TestClient, listing_service: Mock) -> None:
    listing_service.list.return_value = Page(total=1, items=[sample()], pages=1)
    response = client.get("/api/listings?city=Beograd&maxPrice=300&page=2&size=5")
    assert response.status_code == 200
    assert response.json()["items"][0]["ownerId"] == 1
    kwargs = listing_service.list.call_args.kwargs
    assert kwargs["filters"].max_price == 300
    assert kwargs["pagination"].page == 2


def test_create_uses_authenticated_identity(client: TestClient, listing_service: Mock) -> None:
    listing_service.create.return_value = sample()
    response = client.post("/api/listings", headers=HEADERS, json=BODY)
    assert response.status_code == 201
    assert listing_service.create.call_args.kwargs["current_user"].id == 1


def test_read_listing(client: TestClient, listing_service: Mock) -> None:
    listing_service.get.return_value = sample()
    assert client.get("/api/listings/1").status_code == 200
    listing_service.get.assert_called_once_with(listing_id=1)


def test_patch_listing(client: TestClient, listing_service: Mock) -> None:
    listing_service.update.return_value = sample()
    assert client.patch("/api/listings/1", headers=HEADERS, json={"price": 200}).status_code == 200
    assert listing_service.update.call_args.kwargs["data"].model_dump(exclude_unset=True) == {
        "price": 200
    }


def test_delete_listing_has_no_response_body(client: TestClient, listing_service: Mock) -> None:
    response = client.delete("/api/listings/1", headers=HEADERS)
    assert response.status_code == 204
    assert response.content == b""
    listing_service.remove.assert_called_once()


def test_private_list_uses_current_user_id(client: TestClient, listing_service: Mock) -> None:
    listing_service.list.return_value = Page(total=0, items=[], pages=0)
    assert client.get("/api/users/me/listings", headers=HEADERS).status_code == 200
    assert listing_service.list.call_args.kwargs["owner_id"] == 1


def test_not_found_and_forbidden_shapes(client: TestClient, listing_service: Mock) -> None:
    listing_service.get.side_effect = ListingNotFoundException()
    assert client.get("/api/listings/1").json()["code"] == "listing_not_found"
    listing_service.remove.side_effect = NotListingOwnerException()
    response = client.delete("/api/listings/1", headers=HEADERS)
    assert response.status_code == 403
    assert response.json()["code"] == "not_listing_owner"


def test_invalid_body_never_reaches_service(client: TestClient, listing_service: Mock) -> None:
    assert (
        client.post("/api/listings", headers=HEADERS, json={**BODY, "ownerId": 999}).status_code
        == 422
    )
    listing_service.create.assert_not_called()
