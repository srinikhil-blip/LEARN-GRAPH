"""
LearnGraph — Chat & AI Tutor Service
Orchestrates chat dialogue sessions, LangGraph pipeline runs, and response streaming.
"""

from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.langgraph_workflow import LangGraphTutorWorkflow
from app.core.exceptions import NotFoundError
from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession
from app.models.enums import MessageRole, SessionType
from app.repositories.chat_repository import ChatRepository
from app.schemas.chat import (
    ChatMessageResponse,
    ChatSessionCreate,
    ChatSessionResponse,
)


class ChatService:
    """Manages conversations between students and the adaptive AI Tutor."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = ChatRepository(session)
        self._workflow = LangGraphTutorWorkflow()

    async def create_session(
        self, student_id: UUID, req: ChatSessionCreate
    ) -> ChatSessionResponse:
        session = ChatSession(
            student_id=student_id,
            title=req.title or "New Tutoring Session",
            session_type=req.session_type,
            topic_id=req.topic_id,
        )
        self._session.add(session)
        await self._session.flush()
        await self._session.refresh(session)
        return ChatSessionResponse.model_validate(session)

    async def list_sessions(self, student_id: UUID) -> List[ChatSessionResponse]:
        sessions = await self._repo.list_user_sessions(student_id)
        return [ChatSessionResponse.model_validate(s) for s in sessions]

    async def get_messages(self, session_id: UUID) -> List[ChatMessageResponse]:
        messages = await self._repo.get_session_messages(session_id)
        return [ChatMessageResponse.model_validate(m) for m in messages]

    async def send_message(
        self, session_id: UUID, student_id: UUID, content: str
    ) -> ChatMessageResponse:
        session = await self._repo.get_by_id(session_id)
        if not session or session.student_id != student_id:
            raise NotFoundError("Chat session not found")

        # 1. Store user message
        user_msg = ChatMessage(
            session_id=session_id,
            role=MessageRole.user,
            content=content,
        )
        self._session.add(user_msg)

        # 2. Run LangGraph adaptive workflow
        ai_result = await self._workflow.execute_workflow(
            question=content,
            student_id=str(student_id),
        )

        # 3. Store AI Tutor response
        ai_msg = ChatMessage(
            session_id=session_id,
            role=MessageRole.assistant,
            content=ai_result.response,
            sources=ai_result.sources,
        )
        self._session.add(ai_msg)

        session.message_count += 2
        await self._session.flush()
        await self._session.refresh(ai_msg)

        return ChatMessageResponse.model_validate(ai_msg)
