from __future__ import annotations

from uuid import UUID

from pydantic import Field

from app.utils.schemas import CamelCaseModel, CamelCaseResponseModel, TrimmedStr, UtcDatetime


class SendMessage(CamelCaseModel):
    body: TrimmedStr = Field(min_length=1, max_length=2000)
    client_id: UUID


class StartConversation(SendMessage):
    listing_id: int = Field(gt=0)


class ReadConversation(CamelCaseModel):
    through_id: int = Field(gt=0)


class ChatPerson(CamelCaseResponseModel):
    id: int
    display_name: str
    avatar_url: str | None


class ConversationResponse(CamelCaseResponseModel):
    id: int
    listing_id: int | None
    listing_title: str
    person: ChatPerson
    last_message: str
    last_message_at: UtcDatetime
    unread_count: int


class MessageResponse(CamelCaseResponseModel):
    id: int
    sender_id: int
    body: str
    created_at: UtcDatetime


class MessageHistory(CamelCaseModel):
    items: list[MessageResponse]
    has_more: bool


class UnreadResponse(CamelCaseModel):
    count: int
