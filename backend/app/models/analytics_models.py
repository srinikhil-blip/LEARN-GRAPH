"""
LearnGraph — Analytics ORM Models
Aggregates rolling metrics, velocity, and weekly/monthly snapshots.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, UUIDPrimaryKeyMixin


class StudentAnalytics(Base):
    __tablename__ = "student_analytics"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    quizzes_taken: Mapped[int] = mapped_column(Integer, default=0)
    average_quiz_score: Mapped[float] = mapped_column(Float, default=0.0)
    total_study_minutes: Mapped[int] = mapped_column(BigInteger, default=0)
    mastered_concepts_count: Mapped[int] = mapped_column(Integer, default=0)
    weak_concepts_count: Mapped[int] = mapped_column(Integer, default=0)
    learning_velocity: Mapped[float] = mapped_column(Float, default=1.0)
    retention_rate: Mapped[float] = mapped_column(Float, default=85.0)
    last_computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class CourseAnalytics(Base):
    __tablename__ = "course_analytics"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True
    )
    active_students: Mapped[int] = mapped_column(Integer, default=0)
    avg_completion_time_days: Mapped[float] = mapped_column(Float, default=0.0)
    drop_off_topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="SET NULL")
    )
    student_satisfaction_score: Mapped[float] = mapped_column(Float, default=4.8)
    last_computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class WeeklyProgress(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "weekly_progress"
    __table_args__ = (UniqueConstraint("student_id", "year_week", name="uq_student_year_week"),)

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    year_week: Mapped[int] = mapped_column(Integer, nullable=False)
    study_hours: Mapped[float] = mapped_column(Float, default=0.0)
    quizzes_completed: Mapped[int] = mapped_column(Integer, default=0)
    avg_accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    daily_distribution: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class MonthlyProgress(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "monthly_progress"
    __table_args__ = (UniqueConstraint("student_id", "year_month", name="uq_student_year_month"),)

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    year_month: Mapped[int] = mapped_column(Integer, nullable=False)
    study_hours: Mapped[float] = mapped_column(Float, default=0.0)
    concepts_mastered: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
