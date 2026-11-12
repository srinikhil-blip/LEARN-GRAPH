"""
LearnGraph — Notification Service
Coordinates alert dispatching and read status management.
"""

from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import NotificationType
from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationResponse, UnreadCountResponse


class NotificationService:
    """Manages notifications delivered to web client."""

    def __init__(self, session: AsyncSession) -> None:
        self._repo = NotificationRepository(session)

    async def get_user_notifications(
        self, user_id: UUID, unread_only: bool = False
    ) -> List[NotificationResponse]:
        items = await self._repo.list_for_user(user_id, unread_only=unread_only)
        return [NotificationResponse.model_validate(n) for n in items]

    async def get_unread_count(self, user_id: UUID) -> UnreadCountResponse:
        count = await self._repo.get_unread_count(user_id)
        return UnreadCountResponse(count=count)

    async def mark_all_read(self, user_id: UUID) -> int:
        return await self._repo.mark_all_read(user_id)

    async def create_notification(
        self,
        user_id: UUID,
        title: str,
        body: str,
        notification_type: NotificationType = NotificationType.info,
        action_url: str = None,
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            body=body,
            notification_type=notification_type,
            action_url=action_url,
        )
        self._repo._session.add(notif)
        await self._repo._session.flush()
        return notif
