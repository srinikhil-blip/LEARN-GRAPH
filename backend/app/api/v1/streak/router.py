"""
LearnGraph — Streak & Daily Learning Activity API Router
Provides authenticated endpoints for streak inspection, validated milestone submissions,
and calendar streak history.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.streak import (
    LearningActivityCreate,
    StreakHistoryResponse,
    StreakInfo,
    StreakRecordResult,
)
from app.services.streak_service import StreakService

router = APIRouter(prefix="/streak", tags=["Daily Learning Streak"])


@router.get(
    "",
    response_model=StreakInfo,
    summary="Get user daily learning streak",
    description="Returns current streak, longest streak, weekly 7-day indicator, and today's status.",
)
async def get_streak(
    current_user: CurrentUser,
    db: DBSession,
    timezone: Optional[str] = Query(None, description="Client timezone, e.g. Asia/Kolkata"),
) -> StreakInfo:
    """Fetch authoritative streak data for current student."""
    service = StreakService(db)
    return await service.get_streak(current_user.id, timezone_override=timezone)


@router.post(
    "/activity",
    response_model=StreakRecordResult,
    status_code=status.HTTP_201_CREATED,
    summary="Record qualifying learning activity",
    description="Records a verified lesson or quiz completion and advances streak if first activity today.",
)
async def record_streak_activity(
    payload: LearningActivityCreate,
    current_user: CurrentUser,
    db: DBSession,
) -> StreakRecordResult:
    """Record learning milestone and update streak atomically."""
    service = StreakService(db)
    return await service.record_activity(current_user.id, payload)


@router.get(
    "/history",
    response_model=StreakHistoryResponse,
    summary="Get calendar activity history",
    description="Returns past N days of learning activities grouped by calendar date.",
)
async def get_streak_history(
    current_user: CurrentUser,
    db: DBSession,
    days: int = Query(30, ge=7, le=365, description="Number of historical days to inspect"),
) -> StreakHistoryResponse:
    """Retrieve date-aggregated learning history for calendar view."""
    service = StreakService(db)
    return await service.get_history(current_user.id, days=days)
