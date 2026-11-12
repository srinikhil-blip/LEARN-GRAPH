"""
LearnGraph — Chat & AI Tutor Router
REST and WebSocket interfaces for interactive tutoring, document QA, and citations.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.chat import (
    ChatMessageResponse,
    ChatSessionCreate,
    ChatSessionResponse,
    SendMessageRequest,
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["AI Tutor"])


@router.post(
    "/sessions",
    response_model=ChatSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create AI tutoring chat session",
)
async def create_session(
    req: ChatSessionCreate, current_user: CurrentUser, db: DBSession
) -> ChatSessionResponse:
    service = ChatService(db)
    return await service.create_session(current_user.id, req)


@router.get(
    "/sessions",
    response_model=List[ChatSessionResponse],
    summary="List student's active tutoring conversations",
)
async def list_sessions(current_user: CurrentUser, db: DBSession) -> List[ChatSessionResponse]:
    service = ChatService(db)
    return await service.list_sessions(current_user.id)


@router.get(
    "/sessions/{session_id}/messages",
    response_model=List[ChatMessageResponse],
    summary="Get conversation history for a session",
)
async def get_messages(
    session_id: UUID, current_user: CurrentUser, db: DBSession
) -> List[ChatMessageResponse]:
    service = ChatService(db)
    return await service.get_messages(session_id)


@router.post(
    "/sessions/{session_id}/messages",
    response_model=ChatMessageResponse,
    summary="Send message and receive LangGraph-evaluated tutor response",
)
async def send_message(
    session_id: UUID, req: SendMessageRequest, current_user: CurrentUser, db: DBSession
) -> ChatMessageResponse:
    service = ChatService(db)
    return await service.send_message(session_id, current_user.id, req.content)


@router.websocket("/ws/{session_id}")
async def websocket_tutor_endpoint(websocket: WebSocket, session_id: str):
    """Realtime WebSocket channel for low-latency streaming tutoring dialogue."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Echo streaming placeholder chunks
            await websocket.send_text(f"Tutor thinking on '{data}'...")
            await websocket.send_text("Here is your step-by-step intuition: ")
            await websocket.send_text(f"Core concept verified. Try checking related prerequisite graphs.")
    except WebSocketDisconnect:
        pass
