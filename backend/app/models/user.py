"""
LearnGraph — User ORM Model
Represents every human actor on the platform (student, teacher, admin).
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Enum, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.chat_session import ChatSession
    from app.models.notification import Notification
    from app.models.student_profile import StudentProfile
    from app.models.study_goal import StudyGoal
    from app.models.teacher_profile import TeacherProfile
    from app.models.uploaded_file import UploadedFile


class User(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    """
    Core user entity shared by all roles.

    Role-specific data lives in :class:`StudentProfile` or
    :class:`TeacherProfile` via a one-to-one relationship.
    """

    __tablename__ = "users"

    # ------------------------------------------------------------------ #
    # Columns                                                              #
    # ------------------------------------------------------------------ #
    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        nullable=False,
        index=True,
        comment="RFC-5321 compliant e-mail address (login identifier).",
    )
    hashed_password: Mapped[str] = mapped_column(
        String(1024),
        nullable=False,
        comment="Argon2id / bcrypt hash — never store plaintext.",
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", create_type=True),
        nullable=False,
        default=UserRole.student,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    avatar_url: Mapped[Optional[str]] = mapped_column(
        String(2048),
        nullable=True,
    )
    bio: Mapped[Optional[str]] = mapped_column(
        String(1000),
        nullable=True,
    )
    timezone: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="UTC",
    )
    language: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="en",
        comment="BCP-47 language tag, e.g. 'en', 'ta', 'hi'.",
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ------------------------------------------------------------------ #
    # Relationships                                                        #
    # ------------------------------------------------------------------ #
    student_profile: Mapped[Optional["StudentProfile"]] = relationship(
        "StudentProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="select",
    )
    teacher_profile: Mapped[Optional["TeacherProfile"]] = relationship(
        "TeacherProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="select",
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
        order_by="Notification.created_at.desc()",
    )
    chat_sessions: Mapped[List["ChatSession"]] = relationship(
        "ChatSession",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="select",
    )
    uploaded_files: Mapped[List["UploadedFile"]] = relationship(
        "UploadedFile",
        back_populates="uploader",
        cascade="all, delete-orphan",
        lazy="select",
    )
    study_goals: Mapped[List["StudyGoal"]] = relationship(
        "StudyGoal",
        back_populates="student",
        cascade="all, delete-orphan",
        lazy="select",
    )

    # ------------------------------------------------------------------ #
    # Indexes                                                              #
    # ------------------------------------------------------------------ #
    __table_args__ = (
        Index("ix_users_email_role", "email", "role"),
        Index("ix_users_active_role", "is_active", "role"),
    )

    def __repr__(self) -> str:  # noqa: D105
        return (
            f"<User id={self.id} email={self.email!r} role={self.role.value!r}>"
        )
