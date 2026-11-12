"""
LearnGraph — Chat Repository
Data access layer for AI Tutor conversation sessions and turn-by-turn messages.
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession
from app.repositories.base import BaseRepository


class ChatRepository(BaseRepository[ChatSession]):
    """Repository handling Chat Sessions and messages."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, ChatSession)

    async def list_user_sessions(
        self, user_id: UUID, limit: int = 50
    ) -> List[ChatSession]:
        stmt = (
            select(ChatSession)
            .where(ChatSession.student_id == user_id, ChatSession.is_active == True)
            .order_by(ChatSession.updated_at.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_session_messages(
        self, session_id: UUID, limit: int = 100
    ) -> List[ChatMessage]:
        stmt = (
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def add_message(self, message: ChatMessage) -> ChatMessage:
        self._session.add(message)
        await self._session.flush()
        await self._session.refresh(message)
        return message
