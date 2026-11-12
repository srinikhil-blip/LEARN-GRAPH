"""
LearnGraph — Topic ORM Model
Atomic learning unit within a Subject, optionally carrying a pgvector embedding.
"""

import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import ContentType

if TYPE_CHECKING:
    from app.models.lesson import Lesson
    from app.models.question import Question
    from app.models.subject import Subject

# ---------------------------------------------------------------------------
# Optional pgvector import — degrade gracefully if the extension is absent
# ---------------------------------------------------------------------------
try:
    from pgvector.sqlalchemy import Vector  # type: ignore[import-untyped]

    _VECTOR_TYPE = Vector(1536)
except ImportError:  # pragma: no cover
    from sqlalchemy import LargeBinary

    _VECTOR_TYPE = LargeBinary  # type: ignore[assignment]


class Topic(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    A single teaching unit inside a :class:`Subject`.

    Topics hold the actual learning content (text, video link, PDF URL, etc.)
    and an optional 1536-dimensional concept embedding for semantic search
    powered by pgvector / OpenAI Ada-002.
    """

    __tablename__ = "topics"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("subjects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    content_type: Mapped[ContentType] = mapped_column(
        Enum(ContentType, name="content_type", create_type=True),
        nullable=False,
        default=ContentType.text,
    )
    content_url: Mapped[Optional[str]] = mapped_column(
        String(2048), nullable=True
    )
    content_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    key_concepts: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String),
        nullable=True,
        comment="High-level concept labels extracted from content.",
    )
    difficulty_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.5,
        comment="Normalised difficulty 0.0 (easiest) – 1.0 (hardest).",
    )
    estimated_minutes: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )

    # pgvector embedding — 1536 dims (OpenAI Ada-002 / text-embedding-3-small)
    concept_embedding: Mapped[Optional[object]] = mapped_column(
        _VECTOR_TYPE,  # type: ignore[arg-type]
        nullable=True,
        comment="1536-dim OpenAI embedding for semantic similarity search.",
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    subject: Mapped["Subject"] = relationship(
        "Subject",
        back_populates="topics",
        lazy="select",
    )
    lessons: Mapped[List["Lesson"]] = relationship(
        "Lesson",
        back_populates="topic",
        cascade="all, delete-orphan",
        order_by="Lesson.order_index",
        lazy="select",
    )
    quiz_questions: Mapped[List["Question"]] = relationship(
        "Question",
        back_populates="topic",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        Index("ix_topics_subject_order", "subject_id", "order_index"),
        Index("ix_topics_difficulty", "difficulty_score"),
    )

    def __repr__(self) -> str:  # noqa: D105
        return (
            f"<Topic id={self.id} title={self.title!r}"
            f" content_type={self.content_type.value!r}>"
        )
