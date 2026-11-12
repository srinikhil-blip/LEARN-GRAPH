"""
LearnGraph — Answer ORM Model
One selectable answer option for a :class:`Question`.
"""

import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.question import Question


class Answer(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    An answer option for a :class:`Question`.

    For MCQ / True-False questions there will typically be 2–5 Answer rows.
    Short-answer and fill-blank questions use a single row with the
    canonical correct answer.
    """

    __tablename__ = "answers"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    explanation: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Why this option is correct or incorrect.",
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    question: Mapped["Question"] = relationship(
        "Question",
        back_populates="answers",
        lazy="select",
    )

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        Index("ix_answers_question_correct", "question_id", "is_correct"),
    )

    def __repr__(self) -> str:  # noqa: D105
        return (
            f"<Answer id={self.id} question_id={self.question_id}"
            f" is_correct={self.is_correct}>"
        )
