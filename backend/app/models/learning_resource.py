"""
LearnGraph — Learning Resource ORM Models
PostgreSQL tables for courses, topics, categories, and video resources.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ResourceCategory(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Category classification for educational materials (e.g., Video Lectures, Notes, PDFs, Practice)."""
    __tablename__ = "resource_categories"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    icon: Mapped[Optional[str]] = mapped_column(String(50))
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    course_resources: Mapped[List["CourseResource"]] = relationship("CourseResource", back_populates="category")
    topic_resources: Mapped[List["TopicResource"]] = relationship("TopicResource", back_populates="category")


class CourseResource(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Course-level supplementary material (Syllabus, Formula Sheets, Full PDF Guides)."""
    __tablename__ = "course_resources"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("resource_categories.id", ondelete="SET NULL"), index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)  # video, pdf, notes, practice, code, external
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer)
    is_downloadable: Mapped[bool] = mapped_column(Boolean, default=True)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    meta_info: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, default=dict)

    category: Mapped[Optional["ResourceCategory"]] = relationship("ResourceCategory", back_populates="course_resources")


class TopicResource(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Topic-specific learning assets (Notes, Practice Drills, Assignments, Code Sandboxes)."""
    __tablename__ = "topic_resources"

    topic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), index=True, nullable=False
    )
    category_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("resource_categories.id", ondelete="SET NULL"), index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    content_markdown: Mapped[Optional[str]] = mapped_column(Text)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    difficulty: Mapped[str] = mapped_column(String(30), default="intermediate")
    is_completed_by_default: Mapped[bool] = mapped_column(Boolean, default=False)
    meta_info: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, default=dict)

    category: Mapped[Optional["ResourceCategory"]] = relationship("ResourceCategory", back_populates="topic_resources")


class VideoResource(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Video Lecture Entity strictly mapped to YouTube educational content.
    Contains Course ID, Subject ID, Chapter ID, Topic ID, and YouTube metadata.
    """
    __tablename__ = "video_resources"

    course_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="SET NULL"), index=True
    )
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="SET NULL"), index=True
    )
    chapter_id: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="SET NULL"), index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    youtube_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    youtube_video_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    thumbnail: Mapped[str] = mapped_column(String(2048), nullable=False)
    duration: Mapped[str] = mapped_column(String(50), default="20m")
    duration_seconds: Mapped[int] = mapped_column(Integer, default=1200)
    difficulty: Mapped[str] = mapped_column(String(30), default="beginner")  # beginner, intermediate, advanced
    language: Mapped[str] = mapped_column(String(30), default="English")
    provider: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # MIT OCW, NPTEL, Khan Academy, 3Blue1Brown, etc.
    channel_name: Mapped[str] = mapped_column(String(150), nullable=False)
    tags: Mapped[List[str]] = mapped_column(JSONB, default=list)
    views_count: Mapped[int] = mapped_column(Integer, default=0)
    is_recommended: Mapped[bool] = mapped_column(Boolean, default=True)
    created_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
