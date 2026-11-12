"""
LearnGraph — Lesson ORM Model
Rich-content leaf node attached to a Topic.
"""

import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.topic import Topic


class Lesson(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    An individual reading / video lesson within a :class:`Topic`.

    Lessons carry the primary instructional content that the student
    consumes before attempting quizzes.
    """

    __tablename__ = "lessons"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    topic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("topics.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    content: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Markdown / HTML body of the lesson.",
    )
    video_url: Mapped[Optional[str]] = mapped_column(
        String(2048), nullable=True
    )
    duration_seconds: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Video/audio duration in seconds.",
    )
    order_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Zero-based position within the parent topic.",
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    topic: Mapped["Topic"] = relationship(
        "Topic",
        back_populates="lessons",
        lazy="select",
    )

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        Index("ix_lessons_topic_order", "topic_id", "order_index"),
    )

    def __repr__(self) -> str:  # noqa: D105
        return (
            f"<Lesson id={self.id} title={self.title!r}"
            f" topic_id={self.topic_id} order={self.order_index}>"
        )
