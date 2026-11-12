"""
LearnGraph — LearningHistory ORM Model
Tracks per-student progress on each topic they have encountered.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Index, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import LearningStatus

if TYPE_CHECKING:
    from app.models.student_profile import StudentProfile
    from app.models.topic import Topic
    from app.models.user import User


class LearningHistory(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    One row per (student, topic) pair capturing cumulative progress.

    Updated in real-time as the student works through lessons and quizzes.
    """

    __tablename__ = "learning_history"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    topic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("topics.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[LearningStatus] = mapped_column(
        Enum(LearningStatus, name="learning_status", create_type=True),
        nullable=False,
        default=LearningStatus.not_started,
        index=True,
    )
    mastery_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
        comment="Mastery level 0.0–1.0 derived from quiz performance.",
    )
    time_spent_minutes: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    last_accessed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completion_percentage: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Student's personal notes on the topic."
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    student: Mapped["User"] = relationship(
        "User",
        foreign_keys=[student_id],
        lazy="select",
    )
    topic: Mapped["Topic"] = relationship(
        "Topic",
        lazy="select",
    )

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        Index(
            "ix_learning_history_student_topic",
            "student_id",
            "topic_id",
            unique=True,
        ),
        Index("ix_learning_history_status", "status"),
        Index("ix_learning_history_mastery", "mastery_score"),
    )

    def __repr__(self) -> str:  # noqa: D105
        return (
            f"<LearningHistory id={self.id} student_id={self.student_id}"
            f" topic_id={self.topic_id} status={self.status.value!r}>"
        )
