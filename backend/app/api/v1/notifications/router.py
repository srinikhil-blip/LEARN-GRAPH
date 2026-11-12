"""
LearnGraph — Notifications Router
Endpoints for user alerts, unread counts, and batch dismissals.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=List[NotificationResponse],
    summary="Get user notifications",
)
async def list_notifications(
    unread_only: bool = False, current_user: CurrentUser = None, db: DBSession = None
) -> List[NotificationResponse]:
    service = NotificationService(db)
    return await service.get_user_notifications(current_user.id, unread_only=unread_only)


@router.get(
    "/unread-count",
    response_model=UnreadCountResponse,
    summary="Get badge unread count",
)
async def get_unread_count(current_user: CurrentUser, db: DBSession) -> UnreadCountResponse:
    service = NotificationService(db)
    return await service.get_unread_count(current_user.id)


@router.post(
    "/read-all",
    summary="Mark all notifications as read",
)
async def mark_all_read(current_user: CurrentUser, db: DBSession) -> dict:
    service = NotificationService(db)
    count = await service.mark_all_read(current_user.id)
    return {"marked_read": count}
