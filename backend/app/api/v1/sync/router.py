"""
LearnGraph — Sync & Hybrid Query API Router
Exposes endpoints for outbox processing, anti-entropy reconciliation,
system health metrics, and hybrid cross-database queries.
"""

from typing import Any, Dict
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.services.hybrid_query_service import HybridQueryService
from app.services.sync_service import SyncService
from app.workers.tasks.sync_tasks import reconcile_all_drift

router = APIRouter(prefix="/sync", tags=["Hybrid Sync & Graph"])


@router.get(
    "/status",
    summary="Get hybrid database synchronization health",
    description="Returns Outbox queue lag, pending event counts, and connection health for PostgreSQL, Neo4j, and Redis.",
    response_model=Dict[str, Any],
)
async def get_sync_status(session: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """Retrieve health and outbox metrics."""
    sync_svc = SyncService(session)
    return await sync_svc.get_health()


@router.post(
    "/drain",
    summary="Trigger immediate Outbox batch synchronization",
    description="Drains up to `batch_size` pending events from the PostgreSQL Outbox into Neo4j.",
    response_model=Dict[str, Any],
)
async def trigger_outbox_drain(
    batch_size: int = Query(50, ge=1, le=500),
    session: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Manually drain a batch of pending events."""
    sync_svc = SyncService(session)
    return await sync_svc.process_batch(batch_size=batch_size)


@router.post(
    "/reconcile/{student_id}",
    summary="Reconcile student mastery state drift",
    description="Audits PostgreSQL ConceptMastery vs Neo4j relationships for a student and repairs discrepancies.",
    response_model=Dict[str, Any],
)
async def reconcile_student(
    student_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Repair drift for a single student."""
    sync_svc = SyncService(session)
    return await sync_svc.reconcile_student(student_id)


@router.post(
    "/reconcile-all",
    summary="Trigger async anti-entropy audit for all students",
    description="Dispatches a Celery background task to reconcile database drift across all active students.",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=Dict[str, str],
)
async def trigger_all_reconciliation() -> Dict[str, str]:
    """Queue background reconciliation job."""
    task = reconcile_all_drift.delay()
    return {"message": "Reconciliation job queued", "task_id": str(task.id)}


@router.get(
    "/dashboard/{student_id}",
    summary="Hybrid student learning dashboard",
    description="High-performance hybrid query aggregating PostgreSQL stats and Neo4j graph frontiers with Redis caching.",
    response_model=Dict[str, Any],
)
async def get_hybrid_dashboard(
    student_id: UUID,
    session: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Return unified relational + graph learning dashboard."""
    hybrid_svc = HybridQueryService(session)
    return await hybrid_svc.get_student_hybrid_dashboard(student_id)
