"""
LearnGraph — Subjects & Topics Router
Curriculum structure endpoints for subjects, topics, and lessons.
"""

from uuid import UUID
from fastapi import APIRouter, Depends, status

from app.core.dependencies import CurrentUser, DBSession, require_teacher
from app.schemas.course import (
    LessonCreate,
    LessonResponse,
    SubjectCreate,
    SubjectResponse,
    TopicCreate,
    TopicResponse,
)
from app.services.course_service import CourseService

router = APIRouter(prefix="/curriculum", tags=["Curriculum"])


@router.post(
    "/subjects",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create subject under course",
)
async def create_subject(
    data: SubjectCreate,
    current_user: CurrentUser = require_teacher,
    db: DBSession = None,
) -> SubjectResponse:
    service = CourseService(db)
    return await service.create_subject(data)


@router.post(
    "/topics",
    response_model=TopicResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create topic under subject",
)
async def create_topic(
    data: TopicCreate,
    current_user: CurrentUser = require_teacher,
    db: DBSession = None,
) -> TopicResponse:
    service = CourseService(db)
    return await service.create_topic(data)


@router.post(
    "/lessons",
    response_model=LessonResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create lesson under topic",
)
async def create_lesson(
    data: LessonCreate,
    current_user: CurrentUser = require_teacher,
    db: DBSession = None,
) -> LessonResponse:
    service = CourseService(db)
    return await service.create_lesson(data)
