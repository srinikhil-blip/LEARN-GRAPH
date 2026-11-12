"""
LearnGraph — Quiz ORM Model
Container for a set of questions used for assessment, practice, or diagnosis.
"""

import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import QuizType

if TYPE_CHECKING:
    from app.models.question import Question
    from app.models.quiz_result import QuizResult
    from app.models.user import User


class Quiz(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    A quiz can be attached to a :class:`Topic`, a :class:`Course`, or neither.

    AI-generated quizzes record the prompt used for auditability.
    """

    __tablename__ = "quizzes"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("topics.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    course_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    quiz_type: Mapped[QuizType] = mapped_column(
        Enum(QuizType, name="quiz_type", create_type=True),
        nullable=False,
        default=QuizType.practice,
    )
    total_questions: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    time_limit_seconds: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="NULL means no time limit.",
    )
    passing_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=60.0,
        comment="Minimum percentage required to pass.",
    )
    is_ai_generated: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    ai_prompt_used: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="The LLM prompt that generated this quiz, for audit purposes.",
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    created_by: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by_id],
        lazy="select",
    )
    questions: Mapped[List["Question"]] = relationship(
        "Question",
        back_populates="quiz",
        cascade="all, delete-orphan",
        order_by="Question.order_index",
        lazy="select",
    )
    results: Mapped[List["QuizResult"]] = relationship(
        "QuizResult",
        back_populates="quiz",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        Index("ix_quizzes_type", "quiz_type"),
        Index("ix_quizzes_ai_generated", "is_ai_generated"),
    )

    def __repr__(self) -> str:  # noqa: D105
        return (
            f"<Quiz id={self.id} title={self.title!r}"
            f" type={self.quiz_type.value!r} questions={self.total_questions}>"
        )
