"""
LearnGraph — Models Package
Exports all ORM entities and enumerations for application runtime and Alembic discovery.
"""

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.admin_profile import AdminProfile
from app.models.ai_models import (
    Embedding,
    GeneratedQuiz,
    GeneratedSummary,
    PromptHistory,
)
from app.models.analytics_models import (
    CourseAnalytics,
    MonthlyProgress,
    StudentAnalytics,
    WeeklyProgress,
)
from app.models.answer import Answer
from app.models.auth_rbac import (
    Permission,
    RefreshToken,
    Role,
    RolePermission,
    UserRole as UserRoleLink,
    UserSession,
)
from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession
from app.models.concept import Concept
from app.models.course import Course
from app.models.enrollment import (
    ConceptMastery,
    CourseEnrollment,
    LessonProgress,
    TopicProgress,
)
from app.models.enums import (
    ContentType,
    CourseStatus,
    Difficulty,
    DifficultyLevel,
    FileType,
    GoalType,
    LearningStatus,
    LearningStyle,
    MessageRole,
    NotificationType,
    ProcessingStatus,
    QuestionType,
    QuizType,
    RecommendationGenerator,
    ResourceType,
    SessionType,
    UserRole,
    WeakConceptSource,
)
from app.models.extracted_data import ExtractedConcept, ExtractedText
from app.models.learning_history import LearningHistory
from app.models.learning_path import LearningPath, LearningPathItem
from app.models.lesson import Lesson
from app.models.lms_models import GoogleClassroom, LMSSyncLog, MoodleCourse
from app.models.notification import Notification
from app.models.notification_models import NotificationPreference
from app.models.outbox import OutboxEvent, OutboxEventType, OutboxStatus
from app.models.question import Question
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAnswer, QuizAttempt
from app.models.quiz_result import QuizResult
from app.models.recommendation import Recommendation
from app.models.learning_resource import (
    ResourceCategory,
    CourseResource,
    TopicResource,
    VideoResource,
    CourseUnit,
    TopicCurriculumDetail,
    TopicReferenceMaterial,
    TopicPracticeProblem,
)
from app.models.universal_curriculum import (
    EducationLevel,
    Board,
    University,
    Degree,
    Semester,
    CurriculumVersion,
    Subtopic,
    CurriculumBookmark,
    KnowledgeGraphRelation,
)
from app.models.resource import Resource
from app.models.student_profile import StudentProfile
from app.models.study_goal import StudyGoal
from app.models.subject import Subject
from app.models.teacher_profile import TeacherProfile
from app.models.topic import Topic
from app.models.uploaded_file import UploadedFile
from app.models.user import User
from app.models.weak_concept import WeakConcept

__all__ = [
    "Base",
    "TimestampMixin",
    "UUIDPrimaryKeyMixin",
    "SoftDeleteMixin",
    # Enums
    "UserRole",
    "Difficulty",
    "CourseStatus",
    "ContentType",
    "QuizType",
    "QuestionType",
    "DifficultyLevel",
    "LearningStatus",
    "WeakConceptSource",
    "ResourceType",
    "NotificationType",
    "SessionType",
    "MessageRole",
    "FileType",
    "ProcessingStatus",
    "GoalType",
    "LearningStyle",
    "RecommendationGenerator",
    # Entities
    "User",
    "Role",
    "Permission",
    "UserRoleLink",
    "RolePermission",
    "UserSession",
    "RefreshToken",
    "StudentProfile",
    "TeacherProfile",
    "AdminProfile",
    "Course",
    "Subject",
    "Topic",
    "Lesson",
    "Concept",
    "Resource",
    "ResourceCategory",
    "CourseResource",
    "TopicResource",
    "VideoResource",
    "CourseUnit",
    "TopicCurriculumDetail",
    "TopicReferenceMaterial",
    "TopicPracticeProblem",
    "EducationLevel",
    "Board",
    "University",
    "Degree",
    "Semester",
    "CurriculumVersion",
    "Subtopic",
    "CurriculumBookmark",
    "KnowledgeGraphRelation",
    "ResourceCategory",
    "CourseResource",
    "TopicResource",
    "VideoResource",
    "CourseEnrollment",
    "LessonProgress",
    "TopicProgress",
    "ConceptMastery",
    "Quiz",
    "Question",
    "Answer",
    "QuizAttempt",
    "QuizAnswer",
    "QuizResult",
    "LearningHistory",
    "StudyGoal",
    "LearningPath",
    "LearningPathItem",
    "WeakConcept",
    "Recommendation",
    "Notification",
    "NotificationPreference",
    "OutboxEvent",
    "OutboxEventType",
    "OutboxStatus",
    "ChatSession",
    "ChatMessage",
    "PromptHistory",
    "GeneratedQuiz",
    "GeneratedSummary",
    "Embedding",
    "UploadedFile",
    "ExtractedText",
    "ExtractedConcept",
    "GoogleClassroom",
    "MoodleCourse",
    "LMSSyncLog",
    "StudentAnalytics",
    "CourseAnalytics",
    "WeeklyProgress",
    "MonthlyProgress",
]
