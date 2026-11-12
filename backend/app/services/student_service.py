"""
LearnGraph — Student Service
Coordinates student profiles, dashboards, XP progression, and weak concept remediation.
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.graph.graph_service import GraphService
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.student_repository import StudentRepository
from app.schemas.student import (
    StudentDashboardResponse,
    StudentProfileResponse,
    StudentProfileUpdate,
    StudyGoalResponse,
    WeakConceptResponse,
)


class StudentService:
    """Business logic for student workspace and adaptive progress tracking."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = StudentRepository(session)
        self._analytics_repo = AnalyticsRepository(session)
        self._graph_service = GraphService()

    async def get_profile(self, user_id: UUID) -> StudentProfileResponse:
        """Fetch student profile or raise 404."""
        prof = await self._repo.get_by_user_id(user_id)
        if not prof:
            raise NotFoundError("Student profile not found")
        return StudentProfileResponse.model_validate(prof)

    async def update_profile(
        self, user_id: UUID, update_data: StudentProfileUpdate
    ) -> StudentProfileResponse:
        """Update student university, degree, or learning preferences."""
        prof = await self._repo.get_by_user_id(user_id)
        if not prof:
            raise NotFoundError("Student profile not found")

        for key, val in update_data.model_dump(exclude_unset=True).items():
            setattr(prof, key, val)

        await self._session.flush()
        await self._session.refresh(prof)
        return StudentProfileResponse.model_validate(prof)

    async def get_dashboard(self, user_id: UUID) -> StudentDashboardResponse:
        """Aggregate all components for the LearnGraph student dashboard."""
        profile = await self.get_profile(user_id)
        kpis = await self._analytics_repo.get_student_metrics(user_id)
        weak_concepts = await self._repo.get_weak_concepts(user_id, resolved=False)
        goals = await self._repo.get_study_goals(user_id)
        trend = await self._analytics_repo.get_weekly_study_trend(user_id)

        return StudentDashboardResponse(
            profile=profile,
            kpis=kpis,
            weak_concepts=[WeakConceptResponse.model_validate(w) for w in weak_concepts],
            active_goals=[StudyGoalResponse.model_validate(g) for g in goals],
            weekly_trend=trend,
        )

    async def resolve_weak_concept(self, user_id: UUID, concept_id: UUID) -> bool:
        """Mark a concept as overcome."""
        return await self._repo.resolve_weak_concept(concept_id, user_id)
