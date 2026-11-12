"""
LearnGraph — Quiz Repository
Data access layer for quizzes, questions, answers, and quiz attempt results.
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.answer import Answer
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.quiz_result import QuizResult
from app.repositories.base import BaseRepository


class QuizRepository(BaseRepository[Quiz]):
    """Repository handling Quizzes and evaluation results."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Quiz)

    async def get_with_questions(self, quiz_id: UUID) -> Optional[Quiz]:
        stmt = (
            select(Quiz)
            .where(Quiz.id == quiz_id)
            .options(selectinload(Quiz.questions).selectinload(Question.answers))
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_student_history(
        self, student_id: UUID, limit: int = 50
    ) -> List[QuizResult]:
        stmt = (
            select(QuizResult)
            .where(QuizResult.student_id == student_id)
            .order_by(QuizResult.created_at.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def save_result(self, result: QuizResult) -> QuizResult:
        self._session.add(result)
        await self._session.flush()
        await self._session.refresh(result)
        return result
