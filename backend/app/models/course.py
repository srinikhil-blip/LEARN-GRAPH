"""
LearnGraph — Course ORM Model
Top-level learning container authored by a teacher.
"""

import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import CourseStatus, Difficulty

if TYPE_CHECKING:
    from app.models.subject import Subject
    from app.models.teacher_profile import TeacherProfile
    from app.models.user import User


class Course(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    """
    A structured learning course comprising one or more :class:`Subject` modules.

    Courses are owned by a teacher and can be enrolled in by students.
    """

    __tablename__ = "courses"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(4096), nullable=True)
    slug: Mapped[str] = mapped_column(
        String(512),
        unique=True,
        nullable=False,
        index=True,
        comment="URL-safe unique identifier derived from the title.",
    )
    thumbnail_url: Mapped[Optional[str]] = mapped_column(
        String(2048), nullable=True
    )
    teacher_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    difficulty: Mapped[Difficulty] = mapped_column(
        Enum(Difficulty, name="difficulty", create_type=True),
        nullable=False,
        default=Difficulty.beginner,
    )
    status: Mapped[CourseStatus] = mapped_column(
        Enum(CourseStatus, name="course_status", create_type=True),
        nullable=False,
        default=CourseStatus.draft,
        index=True,
    )
    is_featured: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    category: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String), nullable=True)
    estimated_hours: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0
    )
    enrolled_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    completion_rate: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0, comment="Average completion 0–100."
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    teacher: Mapped["User"] = relationship(
        "User",
        foreign_keys=[teacher_id],
        lazy="select",
    )
    subjects: Mapped[List["Subject"]] = relationship(
        "Subject",
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="Subject.order_index",
        lazy="select",
    )
    # Many-to-many student enrollment handled via association table or service
    # layer; direct FK list not stored here to avoid huge in-memory loads.

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        Index("ix_courses_status_featured", "status", "is_featured"),
        Index("ix_courses_category", "category"),
        Index("ix_courses_difficulty", "difficulty"),
    )

    def __repr__(self) -> str:  # noqa: D105
        return (
            f"<Course id={self.id} slug={self.slug!r} status={self.status.value!r}>"
        )
