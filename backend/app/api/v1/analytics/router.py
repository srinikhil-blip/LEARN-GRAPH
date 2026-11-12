"""
LearnGraph — Analytics Router
Exposes learning curve metrics, weekly activity reports, and mastery scores for Recharts visualizations.
"""

from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.analytics import WeeklyReport
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get(
    "/weekly",
    response_model=WeeklyReport,
    summary="Get weekly learning report and activity curve",
)
async def get_weekly_report(current_user: CurrentUser, db: DBSession) -> WeeklyReport:
    """Provides aggregated hours, quiz accuracy distributions, and subject mastery."""
    service = AnalyticsService(db)
    return await service.get_weekly_report(current_user.id)
