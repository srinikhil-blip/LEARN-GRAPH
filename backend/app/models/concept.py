"""
LearnGraph — Concept ORM Model with pgvector Embeddings
Fine-grained learning concepts for Knowledge Graph mapping and vector similarity.
"""

from typing import List, Optional
from pgvector.sqlalchemy import Vector
from sqlalchemy import Float, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Concept(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "concepts"

    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    subject_area: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    importance_weight: Mapped[float] = mapped_column(Float, default=1.0)
    embedding: Mapped[Optional[List[float]]] = mapped_column(Vector(1536))
