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


class CourseUnit(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Course Unit grouping chapters into structured academic modules."""
    __tablename__ = "course_units"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    unit_number: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer, default=0)


class TopicCurriculumDetail(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Production-level comprehensive 14-facet educational content entity.
    Provides textbook-quality theory, worked examples, visual diagrams,
    common mistakes, interview questions, exam tips, and memory tricks.
    """
    __tablename__ = "topic_curriculum_details"

    topic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    overview: Mapped[str] = mapped_column(Text, nullable=False)
    learning_objectives: Mapped[List[str]] = mapped_column(JSONB, default=list)
    prerequisites: Mapped[List[str]] = mapped_column(JSONB, default=list)
    estimated_study_time_minutes: Mapped[int] = mapped_column(Integer, default=30)
    difficulty_level: Mapped[str] = mapped_column(String(30), default="intermediate")
    real_world_applications: Mapped[List[str]] = mapped_column(JSONB, default=list)
    
    # Detailed Explanation
    theory_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    worked_examples: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list)
    visual_diagrams: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list)
    important_notes: Mapped[List[str]] = mapped_column(JSONB, default=list)
    common_mistakes: Mapped[List[Dict[str, str]]] = mapped_column(JSONB, default=list)
    interview_questions: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list)
    competitive_exam_tips: Mapped[List[str]] = mapped_column(JSONB, default=list)
    memory_tricks: Mapped[List[str]] = mapped_column(JSONB, default=list)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    key_takeaways: Mapped[List[str]] = mapped_column(JSONB, default=list)
    faqs: Mapped[List[Dict[str, str]]] = mapped_column(JSONB, default=list)


class TopicReferenceMaterial(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Curated reference material: Books, Research Papers, Documentation, Official Websites, Coding Platforms."""
    __tablename__ = "topic_reference_materials"

    topic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), index=True, nullable=False
    )
    material_type: Mapped[str] = mapped_column(String(50), nullable=False)  # book, paper, documentation, website, tutorial, coding_platform
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    author_or_source: Mapped[Optional[str]] = mapped_column(String(255))
    url: Mapped[Optional[str]] = mapped_column(String(2048))
    description: Mapped[Optional[str]] = mapped_column(Text)
    isbn_or_doi: Mapped[Optional[str]] = mapped_column(String(100))
    is_essential: Mapped[bool] = mapped_column(Boolean, default=False)


class TopicPracticeProblem(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Topic-specific practice questions (MCQ, Numerical, Theory, Coding, PYQ)."""
    __tablename__ = "topic_practice_problems"

    topic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), index=True, nullable=False
    )
    problem_type: Mapped[str] = mapped_column(String(50), default="mcq")  # mcq, numerical, theory, coding, case_study, pyq
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[Optional[List[str]]] = mapped_column(JSONB, default=list)
    correct_answer: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    hint: Mapped[Optional[str]] = mapped_column(Text)
    difficulty: Mapped[str] = mapped_column(String(30), default="medium")
    exam_tag: Mapped[Optional[str]] = mapped_column(String(100))  # e.g., "JEE Main 2023", "GATE CS 2022", "UPSC 2021"
    estimated_time_minutes: Mapped[int] = mapped_column(Integer, default=5)
    code_starter: Mapped[Optional[Dict[str, str]]] = mapped_column(JSONB, default=dict)

