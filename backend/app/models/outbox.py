"""
LearnGraph — Transactional Outbox ORM Model
Stores domain events atomically with PostgreSQL transactional mutations
to guarantee zero data loss and at-least-once delivery to Neo4j.
"""

import enum
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import DateTime, Enum, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class OutboxStatus(str, enum.Enum):
    """Lifecycle status of an outbox event."""
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    PUBLISHED = "PUBLISHED"
    FAILED = "FAILED"
    DEAD_LETTER = "DEAD_LETTER"


class OutboxEventType(str, enum.Enum):
    """Categorized domain event types dispatched across the hybrid boundary."""
    # User / Student events
    STUDENT_REGISTERED = "STUDENT_REGISTERED"
    STUDENT_UPDATED = "STUDENT_UPDATED"
    STUDENT_ENROLLED = "STUDENT_ENROLLED"

    # Curriculum / Topology events
    COURSE_CREATED = "COURSE_CREATED"
    COURSE_UPDATED = "COURSE_UPDATED"
    SUBJECT_CREATED = "SUBJECT_CREATED"
    TOPIC_CREATED = "TOPIC_CREATED"
    TOPIC_UPDATED = "TOPIC_UPDATED"
    CONCEPT_CREATED = "CONCEPT_CREATED"
    CONCEPT_UPDATED = "CONCEPT_UPDATED"
    PREREQUISITE_LINKED = "PREREQUISITE_LINKED"
    PREREQUISITE_REMOVED = "PREREQUISITE_REMOVED"

    # Learning Progress & Quiz events
    QUIZ_COMPLETED = "QUIZ_COMPLETED"
    CONCEPT_MASTERY_UPDATED = "CONCEPT_MASTERY_UPDATED"
    WEAK_CONCEPT_DETECTED = "WEAK_CONCEPT_DETECTED"
    LEARNING_PATH_GENERATED = "LEARNING_PATH_GENERATED"
    RECOMMENDATION_CREATED = "RECOMMENDATION_CREATED"


class OutboxEvent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Transactional Outbox Table.
    Written in the same database transaction as business entities.
    Read by asynchronous worker relays using `FOR UPDATE SKIP LOCKED`.
    """

    __tablename__ = "outbox_events"

    # Aggregate information
    aggregate_type: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
        comment="Type of entity: STUDENT, COURSE, CONCEPT, QUIZ_ATTEMPT",
    )
    aggregate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
        comment="Foreign identity matching PostgreSQL UUID and Neo4j node UUID",
    )

    # Event description
    event_type: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True,
        comment="Specific action performed, e.g. CONCEPT_MASTERY_UPDATED",
    )
    
    # Event payload containing state changes for Neo4j synchronization
    payload: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        comment="Arbitrary JSON payload required by Cypher synchronization mutations",
    )

    # Processing lifecycle
    status: Mapped[OutboxStatus] = mapped_column(
        Enum(OutboxStatus, name="outbox_status_enum", create_type=False),
        nullable=False,
        default=OutboxStatus.PENDING,
        index=True,
        comment="Current processing status",
    )

    retry_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Number of times worker has attempted to process this event",
    )

    max_retries: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=5,
        comment="Maximum allowed retries before moving to DEAD_LETTER",
    )

    error_message: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Last execution error or stack trace if failed",
    )

    processed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp when successfully synchronized into Neo4j",
    )

    __table_args__ = (
        Index("ix_outbox_pending_polling", "status", "created_at"),
        Index("ix_outbox_aggregate_lookup", "aggregate_type", "aggregate_id"),
    )
