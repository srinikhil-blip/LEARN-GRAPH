"""
LearnGraph — WeakConcept ORM Model
Tracks specific concepts a student struggles with, detected from quizzes or AI.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import WeakConceptSource

if TYPE_CHECKING:
    from app.models.user import User


class WeakConcept(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Represents a granular concept where a student has demonstrated weakness.
    Used by the recommendation engine and quiz generator for targeted remediation.
    """

    __tablename__ = "weak_concepts"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    concept_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )
    subject_area: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    failure_count: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    confidence_score: Mapped[float] = mapped_column(
        Float,
        default=0.8,
        nullable=False,
        comment="0.0 to 1.0 indicating AI confidence in weakness",
    )
    last_tested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    is_resolved: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )
    source: Mapped[WeakConceptSource] = mapped_column(
        String(50),
        default=WeakConceptSource.quiz,
        nullable=False,
    )

    # Relationships
    student: Mapped["User"] = relationship("User", backref="weak_concepts")

    def __repr__(self) -> str:
        return f"<WeakConcept(student_id={self.student_id}, concept='{self.concept_name}', resolved={self.is_resolved})>"
