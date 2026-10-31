from __future__ import annotations

from collections.abc import Generator
from datetime import UTC, datetime
from unittest.mock import Mock, create_autospec
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.chat.schemas.chat import ChatPerson, ConversationResponse, MessageHistory, MessageResponse
from app.chat.services.chat import IChatService
from app.utils.di import add_to_di_container, remove_from_di_container
from app.utils.pagination import Page

pytestmark = pytest.mark.unit
BASE = "/api/conversations"
HEADERS = {"Authorization": "Bearer token"}


@pytest.fixture
def chat_service() -> Generator[Mock]:
    service = create_autospec(IChatService, instance=True)
    conversation = ConversationResponse(
        id=5,
        listing_id=1,
        listing_title="Test listing",
        person=ChatPerson(id=2, display_name="Marko", avatar_url=None),
        last_message="Hello",
        last_message_at=datetime(2026, 10, 31, tzinfo=UTC),
        unread_count=1,
    )
    service.start.return_value = conversation
    service.get.return_value = conversation
    service.conversations.return_value = Page(items=[conversation], total=1, pages=1)
    service.unread.return_value = 1
    service.history.return_value = MessageHistory(items=[], has_more=False)
    service.send.return_value = MessageResponse(
        id=1, sender_id=1, body="Hello", created_at=datetime(2026, 10, 31, tzinfo=UTC)
    )
    add_to_di_container(IChatService, service)
    yield service
    remove_from_di_container(IChatService)


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("GET", ""),
        ("GET", "/unread-count"),
        ("GET", "/5"),
        ("GET", "/5/messages"),
        ("POST", ""),
        ("POST", "/5/messages"),
        ("POST", "/5/read"),
    ],
)
def test_chat_endpoints_require_auth(client: TestClient, method: str, path: str) -> None:
    data = (
        {"listingId": 1, "body": "Hello", "clientId": str(uuid4())}
        if path == ""
        else (
            {"body": "Hello", "clientId": str(uuid4())}
            if path.endswith("messages")
            else {"throughId": 1}
        )
    )
    assert (
        client.request(method, BASE + path, json=data if method == "POST" else None).status_code
        == 401
    )


def test_routes_pass_authenticated_identity(client: TestClient, chat_service: Mock) -> None:
    assert client.get(BASE, headers=HEADERS).status_code == 200
    assert chat_service.conversations.call_args.args[0] == 1
    assert client.get(BASE + "/unread-count", headers=HEADERS).json()["count"] == 1
    assert client.get(BASE + "/5", headers=HEADERS).status_code == 200
    chat_service.get.assert_called_once_with(5, 1)
    assert client.get(BASE + "/5/messages", headers=HEADERS).status_code == 200
    chat_service.history.assert_called_once_with(5, 1, None, 50)
    assert (
        client.post(
            BASE, headers=HEADERS, json={"listingId": 1, "body": "Hello", "clientId": str(uuid4())}
        ).status_code
        == 201
    )
    assert chat_service.start.call_args.args[1] == 1
    assert (
        client.post(
            BASE + "/5/messages", headers=HEADERS, json={"body": "Hello", "clientId": str(uuid4())}
        ).status_code
        == 201
    )
    assert chat_service.send.call_args.args[:2] == (5, 1)
    assert client.post(BASE + "/5/read", headers=HEADERS, json={"throughId": 1}).status_code == 204
    assert chat_service.read.call_args.args[:2] == (5, 1)
