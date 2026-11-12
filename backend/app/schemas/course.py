"""
LearnGraph — Course, Subject, Topic, and Lesson Schemas
Validation and serialization models for courses, curriculums, and lessons.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.models.enums import ContentType, CourseStatus, Difficulty


class LessonBase(BaseModel):
    title: str
    content: str
    video_url: Optional[str] = None
    duration_seconds: int = 300
    order_index: int = 0
    is_published: bool = True


class LessonCreate(LessonBase):
    topic_id: UUID


class LessonResponse(LessonBase):
    id: UUID
    topic_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TopicBase(BaseModel):
    title: str
    description: str
    order_index: int = 0
    content_type: ContentType = ContentType.text
    content_text: Optional[str] = None
    key_concepts: List[str] = []
    difficulty_score: float = 0.5
    estimated_minutes: int = 30
    is_published: bool = True


class TopicCreate(TopicBase):
    subject_id: UUID


class TopicResponse(TopicBase):
    id: UUID
    subject_id: UUID
    lessons: List[LessonResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubjectBase(BaseModel):
    title: str
    description: str
    order_index: int = 0
    estimated_minutes: int = 120
    is_published: bool = True


class SubjectCreate(SubjectBase):
    course_id: UUID


class SubjectResponse(SubjectBase):
    id: UUID
    course_id: UUID
    topics: List[TopicResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CourseBase(BaseModel):
    title: str
    description: str
    difficulty: Difficulty = Difficulty.intermediate
    category: str = "Computer Science"
    tags: List[str] = []
    estimated_hours: float = 10.0


class CourseCreate(CourseBase):
    pass


class CourseResponse(CourseBase):
    id: UUID
    slug: str
    thumbnail_url: Optional[str] = None
    teacher_id: UUID
    status: CourseStatus
    enrolled_count: int
    completion_rate: float
    subjects: List[SubjectResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CourseListResponse(BaseModel):
    items: List[CourseResponse]
    total: int
    page: int
    page_size: int
