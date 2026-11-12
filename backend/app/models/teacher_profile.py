"""
LearnGraph — TeacherProfile ORM Model
Institutional and expertise metadata for teacher-role users.
"""

import uuid
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Float, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.user import User


class TeacherProfile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Extended profile for users with *teacher* role.

    Stores institutional affiliation, areas of expertise,
    and an aggregated student-rating score.
    """

    __tablename__ = "teacher_profiles"

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
    department: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    institution: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    expertise_areas: Mapped[Optional[List[str]]] = mapped_column(
        ARRAY(String),
        nullable=True,
        comment="Free-text list of subject-matter expertise tags.",
    )
    years_experience: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    rating: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
        comment="Aggregated student rating 0.0–5.0.",
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    user: Mapped["User"] = relationship(
        "User",
        back_populates="teacher_profile",
        lazy="select",
    )
    courses: Mapped[List["Course"]] = relationship(
        "Course",
        back_populates="teacher",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (Index("ix_teacher_profiles_rating", "rating"),)

    def __repr__(self) -> str:  # noqa: D105
        return (
            f"<TeacherProfile id={self.id} user_id={self.user_id}"
            f" institution={self.institution!r} rating={self.rating}>"
        )
