"""
LearnGraph — Schemas Package
Exports all Pydantic v2 schemas for API requests, responses, and serialization.
"""

from app.schemas.analytics import MasteryScore, WeeklyReport
from app.schemas.auth import (
    ChangePasswordRequest,
    EmailVerificationRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from app.schemas.chat import (
    ChatMessageResponse,
    ChatSessionCreate,
    ChatSessionResponse,
    SendMessageRequest,
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
from app.schemas.graph import GraphAnalytics, GraphEdge, GraphNode, GraphResponse
from app.schemas.notification import NotificationResponse, UnreadCountResponse
from app.schemas.quiz import (
    GenerateQuizRequest,
    QuestionResponse,
    QuizResponse,
    QuizResultResponse,
    QuizSubmission,
)
from app.schemas.student import (
    StudentDashboardResponse,
    StudentProfileResponse,
    StudentProfileUpdate,
    StudyGoalResponse,
    WeakConceptResponse,
)
from app.schemas.upload import UploadedFileResponse

__all__ = [
    "RegisterRequest",
    "LoginRequest",
    "TokenResponse",
    "RefreshTokenRequest",
    "ForgotPasswordRequest",
    "ResetPasswordRequest",
    "ChangePasswordRequest",
    "EmailVerificationRequest",
    "UserResponse",
    "StudentProfileResponse",
    "StudentProfileUpdate",
    "StudentDashboardResponse",
    "WeakConceptResponse",
    "StudyGoalResponse",
    "CourseCreate",
    "CourseResponse",
    "CourseListResponse",
    "SubjectCreate",
    "SubjectResponse",
    "TopicCreate",
    "TopicResponse",
    "LessonCreate",
    "LessonResponse",
    "QuizResponse",
    "GenerateQuizRequest",
    "QuizSubmission",
    "QuizResultResponse",
    "QuestionResponse",
    "GraphResponse",
    "GraphNode",
    "GraphEdge",
    "GraphAnalytics",
    "WeeklyReport",
    "MasteryScore",
    "NotificationResponse",
    "UnreadCountResponse",
    "ChatSessionCreate",
    "ChatSessionResponse",
    "ChatMessageResponse",
    "SendMessageRequest",
    "UploadedFileResponse",
]
