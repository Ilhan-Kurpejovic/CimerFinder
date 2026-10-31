from __future__ import annotations

from app.utils.exceptions import (
    ConflictException,
    ForbiddenException,
    InvalidRequestException,
    NotFoundException,
)


class ConversationNotFound(NotFoundException):
    def __init__(self) -> None:
        super().__init__("Conversation not found", "conversation_not_found")


class NotConversationParticipant(ForbiddenException):
    def __init__(self) -> None:
        super().__init__(
            "Only participants can access this conversation", "not_conversation_participant"
        )


class CannotMessageSelf(InvalidRequestException):
    def __init__(self) -> None:
        super().__init__("Cannot message your own listing", "cannot_message_self")


class ListingUnavailable(ConflictException):
    def __init__(self) -> None:
        super().__init__("This listing is no longer active", "listing_unavailable")


class MessageConflict(ConflictException):
    def __init__(self) -> None:
        super().__init__("Message retry does not match the original", "message_conflict")


class InvalidReadPosition(InvalidRequestException):
    def __init__(self) -> None:
        super().__init__("Read position must belong to this conversation", "invalid_read_position")
