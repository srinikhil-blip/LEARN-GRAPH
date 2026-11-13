"""
LearnGraph Universal Curriculum Database Schema
Normalized PostgreSQL ORM entities supporting multi-tier education, multiple boards,
universities, degree programs, semesters, curriculum versioning, subtopics, and knowledge graph relations.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, DateTime, Float
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class EducationLevel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Tier-based education levels:
    Kindergarten, Primary (Class 1-5), Middle (Class 6-8), Secondary (Class 9-10),
    Higher Secondary (Class 11-12), Undergraduate (UG), Postgraduate (PG),
    Professional Certifications, Programming Tracks, Competitive Exams.
    """
    __tablename__ = "education_levels"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)  # e.g., 'primary', 'secondary', 'ug', 'pg', 'cert', 'exam'
    category: Mapped[str] = mapped_column(String(50), nullable=False)  # 'school', 'higher_ed', 'professional', 'exam'
    description: Mapped[Optional[str]] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Board(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Educational Boards: CBSE, ICSE, State Boards (Maharashtra, AP, TN, Karnataka), IB, Cambridge."""
    __tablename__ = "education_boards"

    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)  # 'cbse', 'icse', 'ib', 'cambridge'
    country: Mapped[str] = mapped_column(String(100), default="India")
    official_website: Mapped[Optional[str]] = mapped_column(String(500))
    description: Mapped[Optional[str]] = mapped_column(Text)


class University(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Institutions / Universities / Certification Authorities: IITs, NITs, AICTE, Stanford, MIT, AWS, Cisco."""
    __tablename__ = "universities"

    name: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)  # 'aicte', 'iit_bombay', 'aws', 'cisco'
    institution_type: Mapped[str] = mapped_column(String(50), default="university")  # 'university', 'college', 'vendor', 'council'
    country: Mapped[str] = mapped_column(String(100), default="India")
    website_url: Mapped[Optional[str]] = mapped_column(String(500))
    is_accredited: Mapped[bool] = mapped_column(Boolean, default=True)


class Degree(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Academic Degrees / Streams: B.Tech, B.Sc, B.Com, MBBS, M.Tech, MBA, AWS Certified Solutions Architect."""
    __tablename__ = "degrees"

    university_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("universities.id", ondelete="SET NULL"), index=True
    )
    education_level_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("education_levels.id", ondelete="SET NULL"), index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # 'btech_cse', 'mbbs', 'aws_csa'
    discipline: Mapped[str] = mapped_column(String(100), nullable=False)  # 'Engineering', 'Medicine', 'Commerce', 'Cloud'
    duration_semesters: Mapped[int] = mapped_column(Integer, default=8)
    description: Mapped[Optional[str]] = mapped_column(Text)


class Semester(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Semesters / Academic Terms / School Grades within a program."""
    __tablename__ = "semesters"

    degree_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("degrees.id", ondelete="CASCADE"), index=True
    )
    semester_number: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(100), nullable=False)  # 'Semester 1', 'Class 10 Term 1'
    academic_year: Mapped[Optional[str]] = mapped_column(String(50))  # e.g., '2025-2026'
    order_index: Mapped[int] = mapped_column(Integer, default=1)


class CurriculumVersion(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Curriculum Versioning Entity.
    Allows updating and introducing new academic syllabi (e.g., NEP 2020, CBSE 2025-26, AICTE v4.2)
    without breaking previous cohort progress or editing source code.
    """
    __tablename__ = "curriculum_versions"

    version_tag: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)  # 'NEP_2025_V1', 'CBSE_2026_V2'
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    governing_body: Mapped[str] = mapped_column(String(150), default="National Academic Directorate")
    effective_year: Mapped[int] = mapped_column(Integer, default=2026)
    changelog: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_deprecated: Mapped[bool] = mapped_column(Boolean, default=False)


class Subtopic(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Atomic granular subtopics nested beneath a Topic."""
    __tablename__ = "subtopics"

    topic_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    summary: Mapped[Optional[str]] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=15)
    key_formulas: Mapped[List[str]] = mapped_column(JSONB, default=list)


class CurriculumBookmark(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """User Saved Bookmarks across courses, chapters, topics, and reference materials."""
    __tablename__ = "curriculum_bookmarks"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    course_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), index=True
    )
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), index=True
    )
    resource_url: Mapped[Optional[str]] = mapped_column(String(2048))
    notes: Mapped[Optional[str]] = mapped_column(Text)


class KnowledgeGraphRelation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Relational knowledge graph connection linking concepts across disciplines:
    PREREQUISITE, DEPENDS_ON, RELATED_TO, ADVANCED_VERSION_OF, CROSS_DOMAIN_ANALOGY.
    """
    __tablename__ = "knowledge_graph_relations"

    source_concept_id: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    target_concept_id: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    relation_type: Mapped[str] = mapped_column(String(50), default="RELATED_TO", index=True)
    weight: Mapped[float] = mapped_column(Float, default=1.0)
    pedagogical_reason: Mapped[Optional[str]] = mapped_column(Text)
    is_bidirectional: Mapped[bool] = mapped_column(Boolean, default=False)
