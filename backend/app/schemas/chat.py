"""
LearnGraph — Chat Schemas
Models for AI Tutor sessions, streaming messages, and knowledge graph citations.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.models.enums import MessageRole, SessionType


class ChatMessageResponse(BaseModel):
    id: UUID
    role: MessageRole
    content: str
    sources: Optional[List[Dict[str, Any]]] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    session_type: SessionType = SessionType.general
    topic_id: Optional[UUID] = None


class ChatSessionResponse(BaseModel):
    id: UUID
    title: str
    session_type: SessionType
    message_count: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SendMessageRequest(BaseModel):
    content: str
