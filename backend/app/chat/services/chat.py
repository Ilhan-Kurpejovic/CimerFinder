from __future__ import annotations

from typing import Protocol

from app.chat.exceptions.chat import (
    CannotMessageSelf,
    ConversationNotFound,
    InvalidReadPosition,
    ListingUnavailable,
    MessageConflict,
    NotConversationParticipant,
)
from app.chat.models.conversation import Conversation
from app.chat.repositories.chat import IChatRepository
from app.chat.schemas.chat import (
    ChatPerson,
    ConversationResponse,
    MessageHistory,
    MessageResponse,
    ReadConversation,
    SendMessage,
    StartConversation,
)
from app.listings.exceptions.listing import ListingNotFoundException
from app.listings.repositories.listing import IListingRepository
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams


class IChatService(Protocol):
    def start(self, data: StartConversation, user_id: int) -> ConversationResponse: ...
    def conversations(
        self, user_id: int, pagination: PaginationParams
    ) -> Page[ConversationResponse]: ...
    def get(self, conversation_id: int, user_id: int) -> ConversationResponse: ...
    def unread(self, user_id: int) -> int: ...
    def history(
        self, conversation_id: int, user_id: int, before_id: int | None, size: int
    ) -> MessageHistory: ...
    def send(self, conversation_id: int, user_id: int, data: SendMessage) -> MessageResponse: ...
    def read(self, conversation_id: int, user_id: int, data: ReadConversation) -> None: ...


@inject(alias=IChatService)
class ChatService(IChatService):
    def __init__(
        self, chat_repository: IChatRepository, listing_repository: IListingRepository
    ) -> None:
        self._repository = chat_repository
        self._listings = listing_repository

    def _owned(self, conversation_id: int, user_id: int) -> Conversation:
        item = self._repository.get(conversation_id)
        if item is None:
            raise ConversationNotFound
        if user_id not in (item.owner_id, item.guest_id):
            raise NotConversationParticipant
        return item

    @staticmethod
    def _response(item: Conversation, user_id: int, unread: int) -> ConversationResponse:
        return ConversationResponse(
            id=item.id,
            listing_id=item.listing_id,
            listing_title=item.listing_title,
            person=ChatPerson.model_validate(
                item.guest if user_id == item.owner_id else item.owner
            ),
            last_message=item.last_message,
            last_message_at=item.last_message_at,
            unread_count=unread,
        )

    def get(self, conversation_id: int, user_id: int) -> ConversationResponse:
        item = self._owned(conversation_id, user_id)
        return self._response(
            item, user_id, self._repository.unread(user_id, [item.id]).get(item.id, 0)
        )

    def start(self, data: StartConversation, user_id: int) -> ConversationResponse:
        previous = self._repository.by_client(user_id, str(data.client_id))
        if previous is not None:
            item = self._owned(previous.conversation_id, user_id)
            if item.listing_id != data.listing_id or previous.body != data.body:
                raise MessageConflict
            return self.get(item.id, user_id)
        listing = self._listings.get(data.listing_id)
        if listing is None:
            raise ListingNotFoundException
        if listing.owner_id == user_id:
            raise CannotMessageSelf
        if listing.status != "active":
            raise ListingUnavailable
        item = self._repository.ensure(listing, user_id)
        self.send(item.id, user_id, data)
        return self.get(item.id, user_id)

    def conversations(
        self, user_id: int, pagination: PaginationParams
    ) -> Page[ConversationResponse]:
        page = self._repository.conversations(user_id, pagination)
        counts = self._repository.unread(user_id, [item.id for item in page.items])
        return Page(
            total=page.total,
            pages=page.pages,
            items=[self._response(item, user_id, counts.get(item.id, 0)) for item in page.items],
        )

    def unread(self, user_id: int) -> int:
        return sum(self._repository.unread(user_id).values())

    def history(
        self, conversation_id: int, user_id: int, before_id: int | None, size: int
    ) -> MessageHistory:
        self._owned(conversation_id, user_id)
        rows = self._repository.history(conversation_id, before_id, size)
        return MessageHistory(
            items=[MessageResponse.model_validate(item) for item in reversed(rows[:size])],
            has_more=len(rows) > size,
        )

    def send(self, conversation_id: int, user_id: int, data: SendMessage) -> MessageResponse:
        item = self._owned(conversation_id, user_id)
        previous = self._repository.by_client(user_id, str(data.client_id))
        if previous is not None:
            if previous.conversation_id != item.id or previous.body != data.body:
                raise MessageConflict
            return MessageResponse.model_validate(previous)
        result = self._repository.send(item, user_id, data.body, str(data.client_id))
        if result.conversation_id != item.id or result.body != data.body:
            raise MessageConflict
        return MessageResponse.model_validate(result)

    def read(self, conversation_id: int, user_id: int, data: ReadConversation) -> None:
        item = self._owned(conversation_id, user_id)
        message = self._repository.message(data.through_id)
        if message is None or message.conversation_id != item.id:
            raise InvalidReadPosition
        self._repository.read(item, user_id, data.through_id)
