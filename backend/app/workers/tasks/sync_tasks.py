"""
LearnGraph — Celery Synchronization & Graph Worker Tasks
Executes outbox batch relays, student graph synchronization, and anti-entropy drift reconciliation.
"""

import asyncio
from typing import Any, Dict, List
from uuid import UUID

import structlog

from app.database.session import database_manager
from app.graph.session import graph_manager
from app.services.sync_service import SyncService
from app.workers.celery_app import celery_app
from app.workers.redis_client import redis_manager

logger = structlog.get_logger(__name__)


def _run_async(coro):
    """Helper to run an async coroutine inside a synchronous Celery task worker."""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)


@celery_app.task(
    name="app.workers.tasks.sync_tasks.process_outbox_batch",
    bind=True,
    max_retries=3,
    default_retry_delay=5,
    acks_late=True,
)
def process_outbox_batch(self, batch_size: int = 50) -> Dict[str, Any]:
    """
    Periodically triggered task that drains pending outbox events
    and synchronizes them into Neo4j AuraDB.
    """
    async def _impl():
        # Ensure graph driver & database pool are connected
        if graph_manager._driver is None:
            await graph_manager.connect()
        if redis_manager._client is None:
            await redis_manager.connect()

        async with database_manager.session() as session:
            sync_svc = SyncService(session)
            return await sync_svc.process_batch(batch_size=batch_size)

    try:
        return _run_async(_impl())
    except Exception as exc:
        logger.error("celery.outbox_batch_failed", error=str(exc))
        raise self.retry(exc=exc)


@celery_app.task(
    name="app.workers.tasks.sync_tasks.sync_student_mastery_to_graph",
    bind=True,
    max_retries=3,
    default_retry_delay=10,
    acks_late=True,
)
def sync_student_mastery_to_graph(
    self, student_id: str, concept_id: str, score: float
) -> Dict[str, Any]:
    """
    Direct asynchronous task to update student mastery in Neo4j and flush Redis cache.
    """
    async def _impl():
        if graph_manager._driver is None:
            await graph_manager.connect()
        if redis_manager._client is None:
            await redis_manager.connect()

        async with database_manager.session() as session:
            sync_svc = SyncService(session)
            from app.models.outbox import OutboxEvent, OutboxEventType
            mock_event = OutboxEvent(
                aggregate_type="STUDENT",
                aggregate_id=UUID(student_id),
                event_type=OutboxEventType.CONCEPT_MASTERY_UPDATED.value,
                payload={"concept_id": concept_id, "score": score},
            )
            await sync_svc._apply_event_to_graph(mock_event)
            await sync_svc._invalidate_cache(mock_event)
            return {"status": "synchronized", "student_id": student_id, "concept_id": concept_id}

    try:
        return _run_async(_impl())
    except Exception as exc:
        logger.error("celery.sync_student_mastery_failed", student_id=student_id, error=str(exc))
        raise self.retry(exc=exc)


@celery_app.task(
    name="app.workers.tasks.sync_tasks.reconcile_student_graph",
    bind=True,
    max_retries=2,
    default_retry_delay=30,
)
def reconcile_student_graph(self, student_id: str) -> Dict[str, Any]:
    """
    Audit and repair state discrepancies between PostgreSQL and Neo4j for a single student.
    """
    async def _impl():
        if graph_manager._driver is None:
            await graph_manager.connect()
        if redis_manager._client is None:
            await redis_manager.connect()

        async with database_manager.session() as session:
            sync_svc = SyncService(session)
            return await sync_svc.reconcile_student(UUID(student_id))

    try:
        return _run_async(_impl())
    except Exception as exc:
        logger.error("celery.reconcile_student_failed", student_id=student_id, error=str(exc))
        raise self.retry(exc=exc)


@celery_app.task(
    name="app.workers.tasks.sync_tasks.reconcile_all_drift",
    bind=True,
)
def reconcile_all_drift(self) -> Dict[str, Any]:
    """
    Scheduled cron task running daily at off-peak hours (e.g. 03:00 UTC).
    Audits active students in PostgreSQL and reconciles Neo4j graph relationships.
    """
    async def _impl():
        if graph_manager._driver is None:
            await graph_manager.connect()
        if redis_manager._client is None:
            await redis_manager.connect()

        async with database_manager.session() as session:
            from sqlalchemy import select
            from app.models.student_profile import StudentProfile

            res = await session.execute(select(StudentProfile.user_id).limit(200))
            student_ids = res.scalars().all()

            sync_svc = SyncService(session)
            reconciled = 0
            total_discrepancies = 0

            for sid in student_ids:
                try:
                    report = await sync_svc.reconcile_student(sid)
                    total_discrepancies += report.get("discrepancies_found", 0)
                    reconciled += 1
                except Exception as e:
                    logger.warning("celery.reconciliation_skip_student", student_id=str(sid), error=str(e))

            return {
                "audited_students": len(student_ids),
                "reconciled_students": reconciled,
                "discrepancies_repaired": total_discrepancies,
                "status": "completed",
            }

    try:
        return _run_async(_impl())
    except Exception as exc:
        logger.error("celery.reconcile_all_drift_failed", error=str(exc))
        raise
