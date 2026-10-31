from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Query

from app.auth.schemas.auth import CurrentUser
from app.chat.schemas.chat import (
    ConversationResponse,
    MessageHistory,
    MessageResponse,
    ReadConversation,
    SendMessage,
    StartConversation,
    UnreadResponse,
)
from app.chat.services.chat import IChatService
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.utils.pagination import Page, PaginationParams, get_pagination_params

router = DBAPIRouter()
User = Annotated[CurrentUser, Depends(get_current_user)]
Service = Annotated[IChatService, Depends(get_di_entity(IChatService))]


@router.get("")
def list_conversations(
    user: User,
    service: Service,
    pagination: Annotated[PaginationParams, Depends(get_pagination_params)],
) -> Page[ConversationResponse]:
    return service.conversations(user.id, pagination)


@router.get("/unread-count")
def unread_count(user: User, service: Service) -> UnreadResponse:
    return UnreadResponse(count=service.unread(user.id))


@router.post("", status_code=201)
def start_conversation(
    data: StartConversation, user: User, service: Service
) -> ConversationResponse:
    return service.start(data, user.id)


@router.get("/{conversation_id}")
def get_conversation(conversation_id: int, user: User, service: Service) -> ConversationResponse:
    return service.get(conversation_id, user.id)


@router.get("/{conversation_id}/messages")
def message_history(
    conversation_id: int,
    user: User,
    service: Service,
    before_id: Annotated[int | None, Query(alias="beforeId", gt=0)] = None,
    size: Annotated[int, Query(ge=1, le=100)] = 50,
) -> MessageHistory:
    return service.history(conversation_id, user.id, before_id, size)


@router.post("/{conversation_id}/messages", status_code=201)
def send_message(
    conversation_id: int, data: SendMessage, user: User, service: Service
) -> MessageResponse:
    return service.send(conversation_id, user.id, data)


@router.post("/{conversation_id}/read", status_code=204, response_model=None)
def mark_read(conversation_id: int, data: ReadConversation, user: User, service: Service) -> None:
    service.read(conversation_id, user.id, data)
