"""
LearnGraph — LMS Integration Models
Google Classroom, Moodle, and synchronization logs.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, UUIDPrimaryKeyMixin


class GoogleClassroom(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "google_classrooms"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    google_course_id: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    enrollment_code: Mapped[Optional[str]] = mapped_column(String(64))
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    sync_status: Mapped[str] = mapped_column(String(32), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class MoodleCourse(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "moodle_courses"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    moodle_course_id: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    moodle_instance_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class LMSSyncLog(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "lms_sync_logs"

    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    records_synced: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(32), default="success")
    log_detail: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
