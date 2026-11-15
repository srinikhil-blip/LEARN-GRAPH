"""
LearnGraph — API v1 Root Router
Aggregates all domain API routers into a single unified v1 router.
"""

from fastapi import APIRouter

from app.api.v1.analytics import router as analytics_router
from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router
from app.api.v1.courses import router as courses_router
from app.api.v1.curriculum import router as curriculum_router
from app.api.v1.knowledge_graph import router as graph_router
from app.api.v1.lms import router as lms_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.quiz import router as quiz_router
from app.api.v1.recommendation import router as recommendation_router
from app.api.v1.streak import router as streak_router
from app.api.v1.students import router as students_router
from app.api.v1.subjects import router as subjects_router
from app.api.v1.sync import router as sync_router
from app.api.v1.teachers import router as teachers_router
from app.api.v1.uploads import router as uploads_router

api_router = APIRouter()

# Include all sub-routers
api_router.include_router(auth_router)
api_router.include_router(streak_router)
api_router.include_router(students_router)
api_router.include_router(teachers_router)
api_router.include_router(courses_router)
api_router.include_router(curriculum_router)
api_router.include_router(subjects_router)
api_router.include_router(graph_router)
api_router.include_router(sync_router)
api_router.include_router(quiz_router)
api_router.include_router(recommendation_router)
api_router.include_router(analytics_router)
api_router.include_router(chat_router)
api_router.include_router(notifications_router)
api_router.include_router(uploads_router)
api_router.include_router(lms_router)

# Direct alias for learning activity recording
from app.core.dependencies import CurrentUser, DBSession
from app.schemas.streak import LearningActivityCreate, StreakRecordResult
from app.services.streak_service import StreakService

@api_router.post(
    "/learning-activity",
    response_model=StreakRecordResult,
    tags=["Daily Learning Streak"],
    summary="Record qualifying learning activity (Top-level alias)",
)
async def record_learning_activity(
    payload: LearningActivityCreate,
    current_user: CurrentUser,
    db: DBSession,
) -> StreakRecordResult:
    service = StreakService(db)
    return await service.record_activity(current_user.id, payload)

__all__ = ["api_router"]
