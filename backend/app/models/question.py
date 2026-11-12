"""
LearnGraph — Question ORM Model
An individual question belonging to a :class:`Quiz`.
"""

import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import DifficultyLevel, QuestionType

if TYPE_CHECKING:
    from app.models.answer import Answer
    from app.models.quiz import Quiz
    from app.models.topic import Topic


class Question(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    A single question within a :class:`Quiz`.

    Supports four formats: MCQ, True/False, Short-Answer, and Fill-in-the-blank.
    """

    __tablename__ = "questions"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    quiz_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("quizzes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("topics.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Optional link to the topic this question tests.",
    )
    question_text: Mapped[str] = mapped_column(
        Text, nullable=False
    )
    question_type: Mapped[QuestionType] = mapped_column(
        Enum(QuestionType, name="question_type", create_type=True),
        nullable=False,
        default=QuestionType.mcq,
    )
    difficulty: Mapped[DifficultyLevel] = mapped_column(
        Enum(DifficultyLevel, name="difficulty_level", create_type=True),
        nullable=False,
        default=DifficultyLevel.medium,
    )
    concept_tested: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="The specific concept being assessed.",
    )
    explanation: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Post-answer rationale shown to the student.",
    )
    order_index: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    points: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Marks awarded for a correct response.",
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    quiz: Mapped["Quiz"] = relationship(
        "Quiz",
        back_populates="questions",
        lazy="select",
    )
    topic: Mapped[Optional["Topic"]] = relationship(
        "Topic",
        back_populates="quiz_questions",
        lazy="select",
    )
    answers: Mapped[List["Answer"]] = relationship(
        "Answer",
        back_populates="question",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        Index("ix_questions_quiz_order", "quiz_id", "order_index"),
        Index("ix_questions_difficulty", "difficulty"),
    )

    def __repr__(self) -> str:  # noqa: D105
        return (
            f"<Question id={self.id} type={self.question_type.value!r}"
            f" difficulty={self.difficulty.value!r} points={self.points}>"
        )
