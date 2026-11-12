"""
LearnGraph — Knowledge Graph Router
Serves student knowledge graph topologies, node neighborhoods, search, and analytics.
"""

from typing import Any, Dict, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query

from app.core.dependencies import CurrentUser
from app.graph.graph_service import GraphService
from app.schemas.graph import GraphAnalytics, GraphResponse

router = APIRouter(prefix="/knowledge-graph", tags=["Knowledge Graph"])


@router.get(
    "/student",
    response_model=GraphResponse,
    summary="Get full interactive knowledge graph for current student",
)
async def get_student_graph(current_user: CurrentUser) -> GraphResponse:
    """
    Returns nodes and edges formatted for React Flow.
    Node status colors:
      - Green: Mastered
      - Yellow: Learning
      - Red: Weak
      - Blue: Recommended
    """
    service = GraphService()
    data = await service.get_student_knowledge_graph(current_user.id)
    return GraphResponse(**data)


@router.get(
    "/analytics",
    response_model=GraphAnalytics,
    summary="Get student graph topology statistics",
)
async def get_graph_analytics(current_user: CurrentUser) -> GraphAnalytics:
    """Calculate counts of mastered, in-progress, weak, and recommended concepts."""
    service = GraphService()
    data = await service.get_graph_analytics(current_user.id)
    return GraphAnalytics(
        mastered_count=data["mastered_count"],
        learning_count=data["learning_count"],
        weak_count=data["weak_count"],
        total_concepts=data["total_concepts"],
        completion_pct=data["completion_pct"],
        strongest_area="Data Structures",
        weakest_area="System Design",
    )


@router.get(
    "/recommended",
    summary="Get graph-recommended next topics based on mastered prerequisites",
)
async def get_recommended_topics(
    limit: int = Query(5, ge=1, le=20),
    current_user: CurrentUser = None,
) -> List[Dict[str, Any]]:
    """Traverse graph to find unlocked topics where all prerequisites are mastered."""
    service = GraphService()
    return await service.get_recommended_next_topics(current_user.id, limit=limit)
