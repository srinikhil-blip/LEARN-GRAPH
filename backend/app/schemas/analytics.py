"""
LearnGraph — Analytics Schemas
Data models for weekly/monthly performance reports, accuracy curves, and study time.
"""

from typing import Any, Dict, List
from pydantic import BaseModel


class MasteryScore(BaseModel):
    subject: str
    mastery_percentage: float
    status: str  # mastered, learning, weak


class WeeklyReport(BaseModel):
    total_study_hours: float
    quizzes_taken: int
    average_quiz_score: float
    xp_gained: int
    streak_days: int
    mastery_scores: List[MasteryScore]
    daily_breakdown: List[Dict[str, Any]]
