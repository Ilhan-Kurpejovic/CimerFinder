from __future__ import annotations

from typing import cast
from unittest.mock import patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

pytestmark = pytest.mark.integration
BASE = "/api/conversations"


def message(body: str = "Ćao, zanima me ovaj oglas!") -> dict[str, str]:
    return {"body": body, "clientId": str(uuid4())}


def start(client: TestClient, headers: dict[str, str], listing_id: int) -> dict[str, object]:
    response = client.post(BASE, headers=headers, json={"listingId": listing_id, **message()})
    assert response.status_code == 201, response.text
    return cast(dict[str, object], response.json())


def test_chat_reply_retry_and_read_positions(
    client: TestClient,
    publisher_headers: dict[str, str],
    other_auth_headers: dict[str, str],
    listing_id: int,
) -> None:
    body = {"listingId": listing_id, **message()}
    created = client.post(BASE, headers=other_auth_headers, json=body)
    assert created.status_code == 201, created.text
    item = created.json()
    url = f"{BASE}/{item['id']}"
    assert "email" not in item["person"]
    assert client.post(BASE, headers=other_auth_headers, json=body).json()["id"] == item["id"]
    assert len(client.get(url + "/messages", headers=other_auth_headers).json()["items"]) == 1
    assert client.get(BASE + "/unread-count", headers=publisher_headers).json()["count"] == 1
    first = client.get(url + "/messages", headers=publisher_headers).json()["items"][0]
    second = client.post(
        url + "/messages", headers=other_auth_headers, json=message("Još jedno pitanje.")
    ).json()
    assert (
        client.post(
            url + "/read", headers=publisher_headers, json={"throughId": first["id"]}
        ).status_code
        == 204
    )
    assert client.get(BASE + "/unread-count", headers=publisher_headers).json()["count"] == 1
    assert (
        client.post(
            url + "/read", headers=publisher_headers, json={"throughId": second["id"]}
        ).status_code
        == 204
    )
    assert (
        client.post(
            url + "/read", headers=publisher_headers, json={"throughId": first["id"]}
        ).status_code
        == 204
    )
    assert client.get(BASE + "/unread-count", headers=publisher_headers).json()["count"] == 0
    reply = message("Naravno, soba je slobodna!")
    sent = client.post(url + "/messages", headers=publisher_headers, json=reply)
    assert sent.status_code == 201, sent.text
    assert (
        client.post(url + "/messages", headers=publisher_headers, json=reply).json()["id"]
        == sent.json()["id"]
    )
    assert (
        client.post(
            url + "/messages", headers=publisher_headers, json={**reply, "body": "Changed"}
        ).status_code
        == 409
    )
    inbox = client.get(BASE, headers=other_auth_headers).json()
    assert inbox["total"] == 1
    assert inbox["items"][0]["unreadCount"] == 1
    assert inbox["items"][0]["lastMessage"] == reply["body"]


def test_chat_auth_participants_and_validation(
    client: TestClient,
    publisher_headers: dict[str, str],
    other_auth_headers: dict[str, str],
    listing_id: int,
) -> None:
    from tests.integration.conftest import register

    third = register(client, "third@example.com")
    item = start(client, other_auth_headers, listing_id)
    url = f"{BASE}/{item['id']}"
    for suffix in ("", "/messages"):
        assert client.get(url + suffix, headers=third).status_code == 403
        assert client.get(url + suffix).status_code == 401
    assert client.get(BASE, headers=third).json()["total"] == 0
    assert client.post(url + "/messages", headers=third, json=message()).status_code == 403
    assert client.post(url + "/read", headers=third, json={"throughId": 1}).status_code == 403
    assert (
        client.post(
            BASE, headers=publisher_headers, json={"listingId": listing_id, **message()}
        ).status_code
        == 400
    )
    for text in (" ", "x" * 2001):
        assert (
            client.post(
                url + "/messages", headers=publisher_headers, json=message(text)
            ).status_code
            == 422
        )
    assert (
        client.post(
            url + "/messages", headers=publisher_headers, json={**message(), "senderId": 999}
        ).status_code
        == 422
    )
    assert (
        client.post(url + "/read", headers=publisher_headers, json={"throughId": 99999}).status_code
        == 400
    )
    assert client.get(BASE + "/99999", headers=third).status_code == 404
    assert (
        client.post(BASE, headers=third, json={"listingId": 99999, **message()}).status_code == 404
    )


def test_history_pagination_and_deleted_listing_keep_conversation(
    client: TestClient,
    publisher_headers: dict[str, str],
    other_auth_headers: dict[str, str],
    listing_id: int,
) -> None:
    from tests.integration.conftest import register

    third = register(client, "third@example.com")
    item = start(client, other_auth_headers, listing_id)
    url = f"{BASE}/{item['id']}"
    for number in range(4):
        assert (
            client.post(
                url + "/messages", headers=publisher_headers, json=message(f"Odgovor {number}")
            ).status_code
            == 201
        )
    newest = client.get(url + "/messages?size=2", headers=other_auth_headers).json()
    assert newest["hasMore"] is True
    assert len(newest["items"]) == 2
    oldest = client.get(
        url + f"/messages?size=10&beforeId={newest['items'][0]['id']}", headers=other_auth_headers
    ).json()
    assert len(oldest["items"]) == 3
    assert oldest["hasMore"] is False
    assert oldest["items"][-1]["id"] < newest["items"][0]["id"]
    assert (
        client.patch(
            f"/api/listings/{listing_id}", headers=publisher_headers, json={"status": "matched"}
        ).status_code
        == 200
    )
    assert (
        client.post(BASE, headers=third, json={"listingId": listing_id, **message()}).status_code
        == 409
    )
    assert (
        client.post(
            url + "/messages", headers=other_auth_headers, json=message("Hvala na javljanju!")
        ).status_code
        == 201
    )
    assert (
        client.delete(f"/api/listings/{listing_id}", headers=publisher_headers).status_code == 204
    )
    kept = client.get(url, headers=other_auth_headers).json()
    assert kept["listingId"] is None
    assert kept["listingTitle"] == item["listingTitle"]
    assert (
        client.post(
            url + "/messages", headers=publisher_headers, json=message("Dogovor ostaje.")
        ).status_code
        == 201
    )


def test_failed_chat_commit_leaves_no_messages(
    client: TestClient, other_auth_headers: dict[str, str], listing_id: int
) -> None:
    with patch.object(Session, "commit", side_effect=RuntimeError), pytest.raises(RuntimeError):
        client.post(BASE, headers=other_auth_headers, json={"listingId": listing_id, **message()})
    assert client.get(BASE, headers=other_auth_headers).json()["total"] == 0
