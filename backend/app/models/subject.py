"""
LearnGraph — Subject ORM Model
An ordered chapter / module within a :class:`Course`.
"""

import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.topic import Topic


class Subject(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    A logical grouping of :class:`Topic` items within a :class:`Course`.

    Subjects are ordered by :attr:`order_index` and can be individually
    published/unpublished independently of their parent course.
    """

    __tablename__ = "subjects"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    order_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Zero-based position within the parent course.",
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    estimated_minutes: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    course: Mapped["Course"] = relationship(
        "Course",
        back_populates="subjects",
        lazy="select",
    )
    topics: Mapped[List["Topic"]] = relationship(
        "Topic",
        back_populates="subject",
        cascade="all, delete-orphan",
        order_by="Topic.order_index",
        lazy="select",
    )

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        Index("ix_subjects_course_order", "course_id", "order_index"),
    )

    def __repr__(self) -> str:  # noqa: D105
        return (
            f"<Subject id={self.id} title={self.title!r}"
            f" course_id={self.course_id} order={self.order_index}>"
        )
