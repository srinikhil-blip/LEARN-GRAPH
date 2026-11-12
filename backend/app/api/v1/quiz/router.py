"""
LearnGraph — Quiz Router
AI quiz generation, submission evaluation, instant grading, and weak concept extraction.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.quiz import (
    GenerateQuizRequest,
    QuizResponse,
    QuizResultResponse,
    QuizSubmission,
)
from app.services.quiz_service import QuizService

router = APIRouter(prefix="/quiz", tags=["Quiz"])


@router.post(
    "/generate",
    response_model=QuizResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate AI-powered adaptive quiz",
)
async def generate_quiz(
    req: GenerateQuizRequest, current_user: CurrentUser, db: DBSession
) -> QuizResponse:
    """Generate diagnostic or practice questions targeted at student's learning gaps."""
    service = QuizService(db)
    return await service.generate_quiz(req, current_user.id)


@router.post(
    "/submit",
    response_model=QuizResultResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit quiz answers for evaluation",
)
async def submit_quiz(
    submission: QuizSubmission, current_user: CurrentUser, db: DBSession
) -> QuizResultResponse:
    """Grade submission, record score, reward XP, and update Neo4j mastery."""
    service = QuizService(db)
    return await service.submit_quiz(submission, current_user.id)


@router.get(
    "/history",
    summary="Get student quiz history",
)
async def get_quiz_history(current_user: CurrentUser, db: DBSession) -> List[dict]:
    """Retrieve all past quiz attempts and scores."""
    service = QuizService(db)
    results = await service._quiz_repo.get_student_history(current_user.id)
    return [
        {
            "id": r.id,
            "quiz_id": r.quiz_id,
            "score": r.score,
            "max_score": r.max_score,
            "percentage": r.percentage,
            "passed": r.passed,
            "time_taken_seconds": r.time_taken_seconds,
            "weak_concepts_identified": r.weak_concepts_identified,
            "created_at": r.created_at,
        }
        for r in results
    ]
