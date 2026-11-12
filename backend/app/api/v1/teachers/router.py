"""
LearnGraph — Teachers Router
Endpoints for educator workspaces, course rosters, and classroom analytics.
"""

from typing import Any, Dict
from fastapi import APIRouter, Depends

from app.core.dependencies import CurrentUser, DBSession, require_teacher

router = APIRouter(prefix="/teachers", tags=["Teachers"])


@router.get("/dashboard", summary="Teacher dashboard metrics")
async def get_teacher_dashboard(
    current_user: CurrentUser = require_teacher,
) -> Dict[str, Any]:
    """Retrieve instructor metrics: active courses, student count, class average mastery."""
    return {
        "teacher_name": current_user.full_name,
        "active_courses": 4,
        "total_students": 142,
        "class_average_score": 78.4,
        "topics_needing_review": [
            {"concept": "Dynamic Programming", "struggling_students": 28},
            {"concept": "Recursion Trees", "struggling_students": 19},
        ],
    }
