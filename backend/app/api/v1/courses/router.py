"""
LearnGraph — Courses Router
Serves course catalog data from the generated curriculum_catalog.json.
Provides /courses (list) and /courses/{slug} (detail) endpoints.
"""

import json
import os
from functools import lru_cache
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Query, HTTPException

router = APIRouter(prefix="/courses", tags=["Courses"])


# ── Catalog loader ──────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_courses() -> List[Dict[str, Any]]:
    """Load and cache all courses from curriculum_catalog.json."""
    paths_to_try = [
        os.path.join("backend", "data", "curriculum_catalog.json"),
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "..", "backend", "data", "curriculum_catalog.json"),
    ]
    for p in paths_to_try:
        abs_path = os.path.normpath(p)
        if os.path.exists(abs_path):
            with open(abs_path, "r", encoding="utf-8") as f:
                catalog = json.load(f)
                return catalog.get("courses", [])
    return []


# ── Routes ───────────────────────────────────────────────────────────────────


@router.get("", summary="List available courses")
async def list_courses(
    tier: Optional[str] = Query(None, description="Filter by education tier"),
    subject: Optional[str] = Query(None, description="Filter by subject"),
    grade: Optional[str] = Query(None, description="Filter by grade or year"),
    search: Optional[str] = Query(None, alias="search"),
    q: Optional[str] = Query(None, alias="q"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    """Return paginated course catalog."""
    courses = _load_courses()

    if tier:
        courses = [c for c in courses if c.get("tier") == tier]
    if subject:
        courses = [c for c in courses if c.get("subject") == subject]
    if grade:
        courses = [c for c in courses if grade in (c.get("gradeOrYear") or "")]

    query = (search or q or "").lower().strip()
    if query:
        def matches(c: Dict) -> bool:
            return any(
                query in str(c.get(f, "")).lower()
                for f in ["title", "subject", "description", "gradeOrYear", "instructor"]
            )
        courses = [c for c in courses if matches(c)]

    total = len(courses)
    start = (page - 1) * page_size
    paginated = courses[start : start + page_size]

    return {
        "items": paginated,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "hasMore": start + page_size < total,
    }


@router.get("/{course_id}", summary="Get course by ID or slug")
async def get_course(course_id: str):
    """Retrieve full course details including chapters and lessons."""
    courses = _load_courses()
    course = next(
        (c for c in courses if c.get("id") == course_id or c.get("id") == course_id.lower()),
        None,
    )
    if not course:
        raise HTTPException(status_code=404, detail=f"Course '{course_id}' not found")
    return course
