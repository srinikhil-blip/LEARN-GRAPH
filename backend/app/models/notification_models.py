"""
LearnGraph — NotificationPreference Model
"""

import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    email_daily_digest: Mapped[bool] = mapped_column(Boolean, default=True)
    email_quiz_results: Mapped[bool] = mapped_column(Boolean, default=True)
    in_app_streak_alerts: Mapped[bool] = mapped_column(Boolean, default=True)
    in_app_ai_recommendations: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
