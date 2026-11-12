"""
LearnGraph — Student Repository
Data access layer for student profiles, weak concepts, learning history, and study goals.
"""

from datetime import UTC, datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.learning_history import LearningHistory
from app.models.student_profile import StudentProfile
from app.models.study_goal import StudyGoal
from app.models.user import User
from app.models.weak_concept import WeakConcept
from app.repositories.base import BaseRepository


class StudentRepository(BaseRepository[StudentProfile]):
    """Repository handling student profile and learning progress data."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, StudentProfile)

    async def get_by_user_id(self, user_id: UUID) -> Optional[StudentProfile]:
        """Retrieve student profile by linked User ID."""
        stmt = (
            select(StudentProfile)
            .where(StudentProfile.user_id == user_id)
            .options(selectinload(StudentProfile.user))
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_weak_concepts(
        self, user_id: UUID, resolved: bool = False
    ) -> List[WeakConcept]:
        """Fetch weak concepts for a student."""
        stmt = (
            select(WeakConcept)
            .where(
                WeakConcept.student_id == user_id,
                WeakConcept.is_resolved == resolved,
            )
            .order_by(WeakConcept.failure_count.desc(), WeakConcept.last_tested_at.desc())
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def resolve_weak_concept(self, concept_id: UUID, user_id: UUID) -> bool:
        """Mark a weak concept as mastered/resolved."""
        stmt = (
            update(WeakConcept)
            .where(WeakConcept.id == concept_id, WeakConcept.student_id == user_id)
            .values(is_resolved=True)
        )
        result = await self._session.execute(stmt)
        await self._session.flush()
        return result.rowcount > 0

    async def get_learning_history(
        self, user_id: UUID, limit: int = 20
    ) -> List[LearningHistory]:
        """Get recent learning history entries."""
        stmt = (
            select(LearningHistory)
            .where(LearningHistory.student_id == user_id)
            .order_by(LearningHistory.last_accessed_at.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_study_goals(self, user_id: UUID) -> List[StudyGoal]:
        """Retrieve active study goals for a student."""
        stmt = (
            select(StudyGoal)
            .where(StudyGoal.student_id == user_id)
            .order_by(StudyGoal.due_date.asc())
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def add_xp(self, user_id: UUID, xp: int) -> StudentProfile:
        """Add XP to student profile and compute level automatically."""
        profile = await self.get_by_user_id(user_id)
        if profile:
            profile.xp_points += xp
            # Every 500 XP is 1 level
            new_level = max(1, 1 + (profile.xp_points // 500))
            profile.level = new_level
            await self._session.flush()
            await self._session.refresh(profile)
        return profile
