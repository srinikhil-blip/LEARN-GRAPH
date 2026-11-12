"""
LearnGraph — Recommendation ORM Model
Personalized learning recommendations generated for students.
"""

import uuid
from typing import TYPE_CHECKING, Any, Dict, Optional

from sqlalchemy import Boolean, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import RecommendationGenerator, ResourceType

if TYPE_CHECKING:
    from app.models.user import User


class Recommendation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Stores an actionable learning item (topic, video, problem, etc.)
    recommended to a student by rule-based or AI systems.
    """

    __tablename__ = "recommendations"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    resource_type: Mapped[ResourceType] = mapped_column(
        String(50),
        nullable=False,
    )
    resource_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    url: Mapped[Optional[str]] = mapped_column(
        String(2048),
        nullable=True,
    )
    reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Why this was recommended (e.g., 'Weak prerequisite in Graph Theory')",
    )
    confidence_score: Mapped[float] = mapped_column(
        Float,
        default=0.85,
        nullable=False,
    )
    is_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    is_dismissed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    generated_by: Mapped[RecommendationGenerator] = mapped_column(
        String(50),
        default=RecommendationGenerator.ai,
        nullable=False,
    )
    meta_info: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
        default=dict,
    )

    # Relationship
    student: Mapped["User"] = relationship("User", backref="recommendations")

    def __repr__(self) -> str:
        return f"<Recommendation(student_id={self.student_id}, title='{self.title[:30]}', type={self.resource_type})>"
