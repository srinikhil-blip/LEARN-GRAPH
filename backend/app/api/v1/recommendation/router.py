"""
LearnGraph — Recommendation Router
Endpoints for hyper-personalized learning suggestions and adaptive remediation plans.
"""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends

from app.ai.recommendation_engine import RecommendationEngine
from app.core.dependencies import CurrentUser, DBSession
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.student_repository import StudentRepository

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("", summary="Get personalized recommendations")
async def get_recommendations(current_user: CurrentUser, db: DBSession) -> List[Dict[str, Any]]:
    """Synthesizes quiz results, weak concepts, and study history into tailored recommendations."""
    student_repo = StudentRepository(db)
    analytics_repo = AnalyticsRepository(db)
    engine = RecommendationEngine()

    weak_concepts = await student_repo.get_weak_concepts(current_user.id)
    kpis = await analytics_repo.get_student_metrics(current_user.id)

    recs = await engine.generate_recommendations(
        student_profile=kpis,
        quiz_scores=[],
        weak_concepts=[w.concept_name for w in weak_concepts],
        graph_data={},
    )
    return [r.model_dump() for r in recs]
