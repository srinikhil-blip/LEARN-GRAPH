"""
LearnGraph — LearningPath & LearningPathItem ORM Models
Adaptive, graph-derived sequences of topics tailored to student weaknesses and goals.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.concept import Concept
    from app.models.topic import Topic
    from app.models.user import User


class LearningPath(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "learning_paths"

    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, default=True)
    source_weak_concepts: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String), default=list)
    total_topics: Mapped[int] = mapped_column(Integer, default=0)
    completed_topics: Mapped[int] = mapped_column(Integer, default=0)
    estimated_hours: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(50), default="active")
    path_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, default=dict)

    items: Mapped[List["LearningPathItem"]] = relationship(
        "LearningPathItem", back_populates="learning_path", cascade="all, delete-orphan", order_by="LearningPathItem.order_index"
    )


class LearningPathItem(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "learning_path_items"
    __table_args__ = (UniqueConstraint("learning_path_id", "order_index", name="uq_path_item_order"),)

    learning_path_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=False, index=True
    )
    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="SET NULL")
    )
    concept_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="SET NULL")
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    learning_path: Mapped["LearningPath"] = relationship("LearningPath", back_populates="items")
