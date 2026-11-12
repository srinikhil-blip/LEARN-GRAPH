"""
LearnGraph — Course Service
Course catalog management, syllabus creation, and knowledge graph synchronization.
"""

from typing import List, Optional
from uuid import UUID
from slugify import slugify
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.graph.graph_service import GraphService
from app.graph.node_models import CourseNode, TopicNode
from app.models.course import Course
from app.models.enums import CourseStatus
from app.models.lesson import Lesson
from app.models.subject import Subject
from app.models.topic import Topic
from app.repositories.course_repository import (
    CourseRepository,
    LessonRepository,
    SubjectRepository,
    TopicRepository,
)
from app.schemas.course import (
    CourseCreate,
    CourseListResponse,
    CourseResponse,
    LessonCreate,
    LessonResponse,
    SubjectCreate,
    SubjectResponse,
    TopicCreate,
    TopicResponse,
)


class CourseService:
    """Manages course lifecycle and instructional hierarchy."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._course_repo = CourseRepository(session)
        self._subject_repo = SubjectRepository(session)
        self._topic_repo = TopicRepository(session)
        self._lesson_repo = LessonRepository(session)
        self._graph_service = GraphService()

    async def list_courses(
        self, category: Optional[str] = None, page: int = 1, page_size: int = 20
    ) -> CourseListResponse:
        offset = (page - 1) * page_size
        courses = await self._course_repo.list_published(category, limit=page_size, offset=offset)
        items = [CourseResponse.model_validate(c) for c in courses]
        return CourseListResponse(items=items, total=len(items), page=page, page_size=page_size)

    async def get_course_by_slug(self, slug: str) -> CourseResponse:
        course = await self._course_repo.get_by_slug(slug)
        if not course:
            raise NotFoundError("Course not found")
        return CourseResponse.model_validate(course)

    async def create_course(self, data: CourseCreate, teacher_id: UUID) -> CourseResponse:
        slug = slugify(data.title)
        course = Course(
            title=data.title,
            description=data.description,
            slug=slug,
            difficulty=data.difficulty,
            category=data.category,
            tags=data.tags,
            estimated_hours=data.estimated_hours,
            teacher_id=teacher_id,
            status=CourseStatus.published,
        )
        self._session.add(course)
        await self._session.flush()
        await self._session.refresh(course)

        # Sync to Neo4j
        try:
            await self._graph_service.create_course(
                CourseNode(
                    id=course.id,
                    title=course.title,
                    slug=course.slug,
                    difficulty=str(course.difficulty),
                    category=course.category,
                )
            )
        except Exception:
            pass

        return CourseResponse.model_validate(course)

    async def create_subject(self, data: SubjectCreate) -> SubjectResponse:
        subject = Subject(**data.model_dump())
        self._session.add(subject)
        await self._session.flush()
        await self._session.refresh(subject)
        return SubjectResponse.model_validate(subject)

    async def create_topic(self, data: TopicCreate) -> TopicResponse:
        topic = Topic(**data.model_dump())
        self._session.add(topic)
        await self._session.flush()
        await self._session.refresh(topic)

        # Sync to Neo4j
        try:
            await self._graph_service.create_topic(
                TopicNode(
                    id=topic.id,
                    title=topic.title,
                    difficulty_score=topic.difficulty_score,
                    key_concepts=topic.key_concepts,
                )
            )
        except Exception:
            pass

        return TopicResponse.model_validate(topic)

    async def create_lesson(self, data: LessonCreate) -> LessonResponse:
        lesson = Lesson(**data.model_dump())
        self._session.add(lesson)
        await self._session.flush()
        await self._session.refresh(lesson)
        return LessonResponse.model_validate(lesson)
