"""
LearnGraph — Repositories Package
Exports all domain repositories implementing the Repository Pattern.
"""

from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.base import BaseRepository
from app.repositories.chat_repository import ChatRepository
from app.repositories.course_repository import (
    CourseRepository,
    LessonRepository,
    SubjectRepository,
    TopicRepository,
)
from app.repositories.notification_repository import NotificationRepository
from app.repositories.outbox_repository import OutboxRepository
from app.repositories.quiz_repository import QuizRepository
from app.repositories.student_repository import StudentRepository
from app.repositories.user_repository import UserRepository

__all__ = [
    "BaseRepository",
    "UserRepository",
    "StudentRepository",
    "CourseRepository",
    "SubjectRepository",
    "TopicRepository",
    "LessonRepository",
    "QuizRepository",
    "AnalyticsRepository",
    "NotificationRepository",
    "OutboxRepository",
    "ChatRepository",
]
