"""
LearnGraph — StudyGoal ORM Model
Student-defined and system-tracked learning goals with progress metrics.
"""

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import GoalType

if TYPE_CHECKING:
    from app.models.user import User


class StudyGoal(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Measurable targets for students (e.g. 5 hours study this week, master Calculus).
    """

    __tablename__ = "study_goals"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    goal_type: Mapped[GoalType] = mapped_column(
        String(50),
        default=GoalType.weekly,
        nullable=False,
    )
    target_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    current_value: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    unit: Mapped[str] = mapped_column(
        String(50),
        default="hours",
        nullable=False,
    )
    due_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )
    is_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    reminder_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Relationship
    student: Mapped["User"] = relationship("User", back_populates="study_goals")

    def __repr__(self) -> str:
        return f"<StudyGoal(student_id={self.student_id}, title='{self.title[:20]}', completed={self.is_completed})>"
