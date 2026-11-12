"""
LearnGraph — StudentProfile ORM Model
Gamification and academic metadata for students.
"""

import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Float, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import LearningStyle

if TYPE_CHECKING:
    from app.models.learning_history import LearningHistory
    from app.models.learning_path import LearningPath
    from app.models.quiz_result import QuizResult
    from app.models.recommendation import Recommendation
    from app.models.user import User
    from app.models.weak_concept import WeakConcept


class StudentProfile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Extended profile for users with *student* role.

    Tracks academic context, gamification state, and learning preferences.
    """

    __tablename__ = "student_profiles"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    university: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    degree: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    year_of_study: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Gamification
    level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    xp_points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    streak_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Aggregate stats
    total_study_hours: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0
    )
    mastery_score: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0, comment="Overall mastery 0–100."
    )
    preferred_difficulty: Mapped[Optional[str]] = mapped_column(
        String(32), nullable=True
    )
    learning_style: Mapped[Optional[LearningStyle]] = mapped_column(
        nullable=True,
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    user: Mapped["User"] = relationship(
        "User",
        back_populates="student_profile",
        lazy="select",
    )
    learning_history: Mapped[List["LearningHistory"]] = relationship(
        "LearningHistory",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="select",
    )
    weak_concepts: Mapped[List["WeakConcept"]] = relationship(
        "WeakConcept",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="select",
    )
    recommendations: Mapped[List["Recommendation"]] = relationship(
        "Recommendation",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="select",
    )
    learning_paths: Mapped[List["LearningPath"]] = relationship(
        "LearningPath",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="select",
    )
    quiz_results: Mapped[List["QuizResult"]] = relationship(
        "QuizResult",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        Index("ix_student_profiles_xp", "xp_points"),
        Index("ix_student_profiles_level", "level"),
    )

    def __repr__(self) -> str:  # noqa: D105
        return (
            f"<StudentProfile id={self.id} user_id={self.user_id}"
            f" level={self.level} xp={self.xp_points}>"
        )
