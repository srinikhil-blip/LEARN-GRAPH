"""
LearnGraph — Outbox Repository
Async repository for transactional outbox persistence, lock-based batch fetching,
and status transitions.
"""

from datetime import UTC, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

import structlog
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.outbox import OutboxEvent, OutboxEventType, OutboxStatus

logger = structlog.get_logger(__name__)


class OutboxRepository:
    """
    Repository handling OutboxEvent persistence and atomic state transitions.
    Operates within the caller's AsyncSession to guarantee ACID atomicity.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_event(
        self,
        aggregate_type: str,
        aggregate_id: UUID,
        event_type: OutboxEventType | str,
        payload: Dict[str, Any],
    ) -> OutboxEvent:
        """
        Record a new domain event inside the current database transaction.
        """
        event_type_str = event_type.value if isinstance(event_type, OutboxEventType) else str(event_type)
        event = OutboxEvent(
            aggregate_type=aggregate_type,
            aggregate_id=aggregate_id,
            event_type=event_type_str,
            payload=payload,
            status=OutboxStatus.PENDING,
            retry_count=0,
        )
        self.session.add(event)
        # We flush so ID and timestamps are assigned, but commit is left to the caller transaction
        await self.session.flush()
        logger.info(
            "outbox.event_staged",
            event_id=str(event.id),
            aggregate_type=aggregate_type,
            aggregate_id=str(aggregate_id),
            event_type=event_type_str,
        )
        return event

    async def fetch_pending_batch(self, batch_size: int = 50) -> List[OutboxEvent]:
        """
        Fetch up to `batch_size` pending outbox events using FOR UPDATE SKIP LOCKED.
        This allows multiple workers to consume the outbox queue simultaneously
        without lock contention or duplicate execution.
        """
        query = (
            select(OutboxEvent)
            .where(OutboxEvent.status == OutboxStatus.PENDING)
            .order_by(OutboxEvent.created_at.asc())
            .limit(batch_size)
            .with_for_update(skip_locked=True)
        )
        result = await self.session.execute(query)
        events = list(result.scalars().all())

        # Transition to PROCESSING immediately
        for event in events:
            event.status = OutboxStatus.PROCESSING

        if events:
            await self.session.flush()

        return events

    async def mark_published(self, event_id: UUID) -> None:
        """Mark an outbox event as successfully synchronized to Neo4j."""
        now = datetime.now(UTC)
        query = (
            update(OutboxEvent)
            .where(OutboxEvent.id == event_id)
            .values(
                status=OutboxStatus.PUBLISHED,
                processed_at=now,
                error_message=None,
            )
        )
        await self.session.execute(query)
        logger.info("outbox.event_published", event_id=str(event_id))

    async def mark_failed(self, event_id: UUID, error_message: str) -> None:
        """
        Increment retry count on failure.
        Moves to DEAD_LETTER if max_retries is reached.
        """
        event = await self.session.get(OutboxEvent, event_id)
        if not event:
            return

        event.retry_count += 1
        event.error_message = error_message[:2000]

        if event.retry_count >= event.max_retries:
            event.status = OutboxStatus.DEAD_LETTER
            logger.error(
                "outbox.event_dead_lettered",
                event_id=str(event_id),
                retry_count=event.retry_count,
                error=error_message,
            )
        else:
            event.status = OutboxStatus.PENDING
            logger.warning(
                "outbox.event_retry_scheduled",
                event_id=str(event_id),
                retry_count=event.retry_count,
                error=error_message,
            )
        await self.session.flush()

    async def get_metrics(self) -> Dict[str, Any]:
        """Retrieve operational health metrics of the Outbox."""
        query = select(
            OutboxEvent.status,
            func.count(OutboxEvent.id).label("count"),
        ).group_by(OutboxEvent.status)
        result = await self.session.execute(query)
        status_counts = {row.status.value: row.count for row in result.all()}

        # Check oldest pending event for lag detection
        oldest_pending_query = (
            select(OutboxEvent.created_at)
            .where(OutboxEvent.status == OutboxStatus.PENDING)
            .order_by(OutboxEvent.created_at.asc())
            .limit(1)
        )
        oldest_pending_res = await self.session.execute(oldest_pending_query)
        oldest_pending = oldest_pending_res.scalar_one_or_none()

        lag_seconds = 0.0
        if oldest_pending:
            lag_seconds = (datetime.now(UTC) - oldest_pending.replace(tzinfo=UTC)).total_seconds()

        return {
            "status_counts": status_counts,
            "pending_count": status_counts.get(OutboxStatus.PENDING.value, 0),
            "dead_letter_count": status_counts.get(OutboxStatus.DEAD_LETTER.value, 0),
            "published_count": status_counts.get(OutboxStatus.PUBLISHED.value, 0),
            "lag_seconds": max(0.0, lag_seconds),
        }
