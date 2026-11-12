"""
LearnGraph — Resource ORM Model
Supplementary materials (books, videos, problems) tied to topics or concepts.
"""

import uuid
from typing import Any, Dict, Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import ResourceType


class Resource(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "resources"

    topic_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("topics.id", ondelete="SET NULL"), index=True
    )
    concept_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("concepts.id", ondelete="SET NULL"), index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_type: Mapped[ResourceType] = mapped_column(String(50), nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    author: Mapped[Optional[str]] = mapped_column(String(255))
    estimated_duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    is_free: Mapped[bool] = mapped_column(Boolean, default=True)
    meta_info: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, default=dict)
