"""
LearnGraph — Streak & Learning Activity Pydantic Schemas
Defines request and response schemas for streak inspection, validated activity recording,
and calendar history tracking.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class StreakInfo(BaseModel):
    """Current state of a student's daily learning streak."""

    current_streak: int = Field(..., ge=0, description="Active streak in consecutive calendar days.")
    longest_streak: int = Field(..., ge=0, description="All-time longest streak recorded for user.")
    total_active_days: int = Field(..., ge=0, description="Total unique calendar days with activity.")
    last_activity_date: Optional[str] = Field(None, description="Last active date (YYYY-MM-DD).")
    is_active_today: bool = Field(..., description="Whether user completed qualifying learning today.")
    today_date: str = Field(..., description="Current calendar date in user's authoritative timezone.")
    user_timezone: str = Field(..., description="Authoritative user timezone (e.g. Asia/Kolkata).")
    weekly_activity: List[bool] = Field(..., description="7-day activity array for Monday through Sunday.")
    weekly_labels: List[str] = Field(
        default=["M", "T", "W", "T", "F", "S", "S"],
        description="Day labels corresponding to weekly_activity.",
    )
    motivational_message: str = Field(..., description="Contextual message based on streak state.")
    next_milestone: int = Field(..., ge=1, description="Next target milestone (3, 7, 14, 30, 50, 100).")
    days_to_next_milestone: int = Field(..., ge=0, description="Days remaining until next milestone.")
    unlocked_milestones: List[int] = Field(default=[], description="List of reached milestone days.")
    new_milestone_achieved: Optional[int] = Field(
        None, description="Newly unlocked milestone on this submission (if any)."
    )


class LearningActivityCreate(BaseModel):
    """Payload to record a verified qualifying learning activity."""

    activity_type: str = Field(
        ...,
        description="Type: 'lesson_completion', 'quiz_completion', 'exercise_completion', 'milestone_completion'.",
    )
    course_id: Optional[str] = Field(None, description="Associated course identifier.")
    lesson_id: Optional[str] = Field(None, description="Associated lesson or topic identifier.")
    quiz_id: Optional[str] = Field(None, description="Associated quiz identifier.")
    score: Optional[float] = Field(None, description="Verified accuracy or percentage (0-100).")
    details: Optional[str] = Field(None, description="Optional metadata or JSON serialized details.")
    timezone: Optional[str] = Field(None, description="Optional client timezone; defaults to user profile.")


class LearningActivityResponse(BaseModel):
    """Response record for an inserted learning activity."""

    id: str
    user_id: str
    activity_type: str
    activity_date: str
    created_at: str
    course_id: Optional[str] = None
    lesson_id: Optional[str] = None
    quiz_id: Optional[str] = None
    score: Optional[float] = None


class StreakRecordResult(BaseModel):
    """Response returned upon recording a qualifying activity."""

    success: bool
    streak: StreakInfo
    activity: Optional[LearningActivityResponse] = None
    message: str
    new_milestone_reached: Optional[int] = None


class StreakDayHistory(BaseModel):
    """Summary of learning activity on a specific calendar date."""

    date: str = Field(..., description="Calendar date (YYYY-MM-DD).")
    activity_count: int = Field(..., ge=0, description="Number of qualifying activities logged on this date.")
    activity_types: List[str] = Field(default=[], description="List of activity types recorded.")


class StreakHistoryResponse(BaseModel):
    """Historical calendar streak activity."""

    history: List[StreakDayHistory]
    total_active_days: int
    longest_streak: int
    current_streak: int
