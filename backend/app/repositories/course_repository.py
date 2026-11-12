"""
LearnGraph — Course, Subject, Topic, and Lesson Repository
Data access layer for instructional catalog structures.
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.course import Course
from app.models.enums import CourseStatus
from app.models.lesson import Lesson
from app.models.subject import Subject
from app.models.topic import Topic
from app.repositories.base import BaseRepository


class CourseRepository(BaseRepository[Course]):
    """Repository handling Courses catalog."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Course)

    async def get_by_slug(self, slug: str) -> Optional[Course]:
        stmt = (
            select(Course)
            .where(Course.slug == slug)
            .options(
                selectinload(Course.teacher),
                selectinload(Course.subjects).selectinload(Subject.topics),
            )
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_published(
        self, category: Optional[str] = None, limit: int = 20, offset: int = 0
    ) -> List[Course]:
        stmt = select(Course).where(Course.status == CourseStatus.published)
        if category:
            stmt = stmt.where(Course.category == category)
        stmt = stmt.order_by(Course.created_at.desc()).offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class SubjectRepository(BaseRepository[Subject]):
    """Repository handling Subjects under Courses."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Subject)

    async def get_by_course(self, course_id: UUID) -> List[Subject]:
        stmt = (
            select(Subject)
            .where(Subject.course_id == course_id)
            .order_by(Subject.order_index.asc())
            .options(selectinload(Subject.topics))
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class TopicRepository(BaseRepository[Topic]):
    """Repository handling individual Topics with concepts and vector embeddings."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Topic)

    async def get_by_subject(self, subject_id: UUID) -> List[Topic]:
        stmt = (
            select(Topic)
            .where(Topic.subject_id == subject_id)
            .order_by(Topic.order_index.asc())
            .options(selectinload(Topic.lessons))
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def search_by_concept(self, concept_name: str, limit: int = 10) -> List[Topic]:
        stmt = (
            select(Topic)
            .where(Topic.key_concepts.contains([concept_name]))
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class LessonRepository(BaseRepository[Lesson]):
    """Repository handling Lessons inside a Topic."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Lesson)

    async def get_by_topic(self, topic_id: UUID) -> List[Lesson]:
        stmt = (
            select(Lesson)
            .where(Lesson.topic_id == topic_id)
            .order_by(Lesson.order_index.asc())
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())
