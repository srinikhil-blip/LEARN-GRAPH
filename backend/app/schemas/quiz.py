"""
LearnGraph — Quiz Schemas
Validation and serialization models for quiz generation, execution, and grading.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.models.enums import DifficultyLevel, QuestionType, QuizType


class AnswerResponse(BaseModel):
    id: UUID
    answer_text: str

    model_config = ConfigDict(from_attributes=True)


class QuestionResponse(BaseModel):
    id: UUID
    question_text: str
    question_type: QuestionType
    difficulty: DifficultyLevel
    points: int
    answers: List[AnswerResponse] = []

    model_config = ConfigDict(from_attributes=True)


class QuizResponse(BaseModel):
    id: UUID
    title: str
    quiz_type: QuizType
    total_questions: int
    time_limit_seconds: int
    passing_score: float
    questions: List[QuestionResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GenerateQuizRequest(BaseModel):
    topic_id: Optional[UUID] = None
    topic_name: Optional[str] = "Data Structures"
    difficulty: str = "medium"
    num_questions: int = 5
    focus_weak_concepts: bool = True


class AnswerSubmission(BaseModel):
    question_id: UUID
    selected_answer: str


class QuizSubmission(BaseModel):
    quiz_id: UUID
    answers: List[AnswerSubmission]
    time_taken_seconds: int


class QuestionReview(BaseModel):
    question_text: str
    your_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str


class QuizResultResponse(BaseModel):
    id: UUID
    quiz_id: UUID
    score: float
    max_score: float
    percentage: float
    passed: bool
    time_taken_seconds: int
    weak_concepts_identified: List[str] = []
    correct_count: int
    wrong_count: int
    review: List[QuestionReview] = []

    model_config = ConfigDict(from_attributes=True)
