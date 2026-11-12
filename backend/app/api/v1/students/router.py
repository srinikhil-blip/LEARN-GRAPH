"""
LearnGraph — Students Router
Endpoints for student profile, adaptive dashboard, mastery metrics, and weak concepts.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.student import (
    StudentDashboardResponse,
    StudentProfileResponse,
    StudentProfileUpdate,
    WeakConceptResponse,
)
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["Students"])


@router.get(
    "/profile",
    response_model=StudentProfileResponse,
    summary="Get student profile",
)
async def get_profile(current_user: CurrentUser, db: DBSession) -> StudentProfileResponse:
    """Fetch university, degree, level, XP, and streak for current student."""
    service = StudentService(db)
    return await service.get_profile(current_user.id)


@router.put(
    "/profile",
    response_model=StudentProfileResponse,
    summary="Update student profile",
)
async def update_profile(
    data: StudentProfileUpdate, current_user: CurrentUser, db: DBSession
) -> StudentProfileResponse:
    """Update study goals, university, or preferred learning modality."""
    service = StudentService(db)
    return await service.update_profile(current_user.id, data)


@router.get(
    "/dashboard",
    response_model=StudentDashboardResponse,
    summary="Get aggregated student dashboard",
)
async def get_dashboard(current_user: CurrentUser, db: DBSession) -> StudentDashboardResponse:
    """Retrieve full dashboard data including KPIs, goals, and performance trends."""
    service = StudentService(db)
    return await service.get_dashboard(current_user.id)


@router.get(
    "/weak-concepts",
    response_model=List[WeakConceptResponse],
    summary="Get identified weak concepts",
)
async def get_weak_concepts(current_user: CurrentUser, db: DBSession) -> List[WeakConceptResponse]:
    """List unresolved weak concepts flagged by quizzes or diagnostic AI."""
    service = StudentService(db)
    concepts = await service._repo.get_weak_concepts(current_user.id, resolved=False)
    return [WeakConceptResponse.model_validate(c) for c in concepts]


@router.post(
    "/weak-concepts/{concept_id}/resolve",
    summary="Mark weak concept as resolved",
)
async def resolve_weak_concept(
    concept_id: UUID, current_user: CurrentUser, db: DBSession
) -> dict:
    """Manually or assessment-driven resolution of a learning weakness."""
    service = StudentService(db)
    success = await service.resolve_weak_concept(current_user.id, concept_id)
    return {"success": success}
