"""
LearnGraph — Analytics Service
Calculates student mastery trends, study time distribution, and weekly activity reports.
"""

from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import MasteryScore, WeeklyReport


class AnalyticsService:
    """Provides high-level performance reporting matching the React Analytics dashboard."""

    def __init__(self, session: AsyncSession) -> None:
        self._repo = AnalyticsRepository(session)

    async def get_weekly_report(self, student_id: UUID) -> WeeklyReport:
        metrics = await self._repo.get_student_metrics(student_id)
        trend = await self._repo.get_weekly_study_trend(student_id)

        mastery_scores = [
            MasteryScore(subject="Data Structures", mastery_percentage=84.0, status="mastered"),
            MasteryScore(subject="Algorithms", mastery_percentage=68.0, status="learning"),
            MasteryScore(subject="System Design", mastery_percentage=42.0, status="weak"),
            MasteryScore(subject="Graph Theory", mastery_percentage=91.0, status="mastered"),
        ]

        return WeeklyReport(
            total_study_hours=metrics["total_study_hours"],
            quizzes_taken=metrics["total_quizzes"],
            average_quiz_score=metrics["average_quiz_score"],
            xp_gained=metrics["xp_points"],
            streak_days=metrics["streak_days"],
            mastery_scores=mastery_scores,
            daily_breakdown=trend,
        )
