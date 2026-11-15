"""
LearnGraph — LearningActivity ORM Model
Stores verified, qualifying learning activities (lesson completions, quiz completions,
milestone accomplishments) for persistent daily streak reckoning and academic history.
"""

import enum
import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import Date, DateTime, Float, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class ActivityType(str, enum.Enum):
    """Categorization of qualifying learning activities that advance daily streaks."""

    lesson_completion = "lesson_completion"
    quiz_completion = "quiz_completion"
    exercise_completion = "exercise_completion"
    milestone_completion = "milestone_completion"


class LearningActivity(UUIDPrimaryKeyMixin, Base):
    """
    Immutable activity record capturing an authentic learning milestone.

    One record per verified learning action. Grouped by (user_id, activity_date)
    to calculate calendar-day streaks in the student's authoritative timezone.
    """

    __tablename__ = "learning_activities"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    activity_type: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
        comment="Type: lesson_completion, quiz_completion, exercise_completion, etc.",
    )
    activity_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
        comment="Local calendar date in the student's authoritative timezone (YYYY-MM-DD).",
    )
    user_timezone: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="Asia/Kolkata",
        comment="Timezone active when the learning activity was committed.",
    )
    course_id: Mapped[Optional[str]] = mapped_column(
        String(128),
        nullable=True,
        index=True,
    )
    lesson_id: Mapped[Optional[str]] = mapped_column(
        String(128),
        nullable=True,
        index=True,
    )
    quiz_id: Mapped[Optional[str]] = mapped_column(
        String(128),
        nullable=True,
        index=True,
    )
    score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Normalized score or percentage achieved, if applicable.",
    )
    details: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Serialized metadata (JSON string) describing the activity.",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="UTC timestamp of the verified submission.",
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
        lazy="select",
    )

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        Index("ix_learning_activities_user_date", "user_id", "activity_date"),
        Index("ix_learning_activities_user_created", "user_id", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<LearningActivity(id={self.id}, user_id={self.user_id}, "
            f"type='{self.activity_type}', date={self.activity_date})>"
        )
