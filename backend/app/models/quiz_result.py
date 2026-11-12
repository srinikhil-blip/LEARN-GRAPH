"""
LearnGraph — QuizResult ORM Model
Persists each student attempt at a quiz including per-answer telemetry.
"""

import uuid
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from sqlalchemy import Boolean, Float, ForeignKey, Index, Integer
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.quiz import Quiz
    from app.models.student_profile import StudentProfile
    from app.models.user import User


class QuizResult(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Records one attempt by a student on a :class:`Quiz`.

    :attr:`answers_given` is a JSONB snapshot of
    ``{question_id: chosen_answer_id}`` pairs so we can replay the session
    without joining answer tables.
    """

    __tablename__ = "quiz_results"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    quiz_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("quizzes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    score: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0, comment="Raw points earned."
    )
    max_score: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0, comment="Total points available."
    )
    percentage: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0, comment="Score as a percentage 0–100."
    )
    time_taken_seconds: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    answers_given: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Snapshot: {question_id: answer_id | answer_text}.",
    )
    weak_concepts_identified: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String),
        nullable=True,
        comment="Concepts the student struggled with in this attempt.",
    )
    passed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    attempt_number: Mapped[int] = mapped_column(
        Integer, nullable=False, default=1
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    student: Mapped["User"] = relationship(
        "User",
        foreign_keys=[student_id],
        lazy="select",
    )
    quiz: Mapped["Quiz"] = relationship(
        "Quiz",
        back_populates="results",
        lazy="select",
    )

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        Index("ix_quiz_results_student_quiz", "student_id", "quiz_id"),
        Index("ix_quiz_results_passed", "passed"),
        Index("ix_quiz_results_percentage", "percentage"),
    )

    def __repr__(self) -> str:  # noqa: D105
        return (
            f"<QuizResult id={self.id} student_id={self.student_id}"
            f" quiz_id={self.quiz_id} pct={self.percentage:.1f}% passed={self.passed}>"
        )
