"""
LearnGraph — Student Pydantic v2 Schemas
Validation and serialization models for student profiles, dashboards, and progress.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import GoalType, LearningStyle


class StudentProfileBase(BaseModel):
    university: Optional[str] = None
    degree: Optional[str] = None
    year_of_study: Optional[int] = Field(default=None, ge=1, le=10)
    preferred_difficulty: Optional[str] = "intermediate"
    learning_style: Optional[LearningStyle] = LearningStyle.visual


class StudentProfileUpdate(StudentProfileBase):
    pass


class StudentProfileResponse(StudentProfileBase):
    id: UUID
    user_id: UUID
    level: int
    xp_points: int
    streak_days: int
    total_study_hours: float
    mastery_score: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WeakConceptResponse(BaseModel):
    id: UUID
    concept_name: str
    subject_area: str
    failure_count: int
    confidence_score: float
    last_tested_at: datetime
    is_resolved: bool

    model_config = ConfigDict(from_attributes=True)


class StudyGoalResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    goal_type: GoalType
    target_value: float
    current_value: float
    unit: str
    is_completed: bool

    model_config = ConfigDict(from_attributes=True)


class StudentDashboardResponse(BaseModel):
    profile: StudentProfileResponse
    kpis: Dict[str, Any]
    weak_concepts: List[WeakConceptResponse]
    active_goals: List[StudyGoalResponse]
    weekly_trend: List[Dict[str, Any]]
