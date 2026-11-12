"""
LearnGraph — Pydantic Models for Neo4j Graph Nodes and Relationships
Represents all 19 Node Types and standardized relationship properties for LearnGraph.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ── Shared Graph Base Models ──────────────────────────────────────────────────

class GraphBase(BaseModel):
    """Base model for all graph entities."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class StandardNodeProperties(GraphBase):
    """
    Standard properties present on all 19 LearnGraph node types:
    UUID, Name, Description, Difficulty, EstimatedLearningTime, CreatedAt, UpdatedAt, Status, Metadata
    """
    uuid: str = Field(..., description="Unique UUID identifier")
    name: str = Field(..., min_length=1, max_length=512, description="Display name")
    description: Optional[str] = Field(default="", description="Detailed summary")
    difficulty: Optional[str] = Field(default="intermediate", description="beginner | intermediate | advanced | expert")
    estimated_learning_time: Optional[int] = Field(default=30, alias="estimatedLearningTime", description="Estimated minutes to complete")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow, alias="createdAt")
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow, alias="updatedAt")
    status: Optional[str] = Field(default="active", description="active | archived | draft | completed")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)


class StandardRelationshipProperties(GraphBase):
    """
    Standard properties present on graph relationships:
    Strength, Confidence, Weight, CreatedAt, UpdatedAt
    """
    strength: Optional[float] = Field(default=1.0, ge=0.0, le=1.0)
    confidence: Optional[float] = Field(default=0.9, ge=0.0, le=1.0)
    weight: Optional[float] = Field(default=1.0, ge=0.0)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow, alias="createdAt")
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow, alias="updatedAt")


# ── 19 Concrete Node Models ───────────────────────────────────────────────────

# 1. Student
class StudentNode(StandardNodeProperties):
    id: Optional[str] = None  # Backward compatibility alias for uuid
    email: EmailStr
    level: int = Field(default=1, ge=1)
    xp_points: int = Field(default=0, ge=0, alias="xpPoints")
    mastery_score: float = Field(default=0.0, ge=0.0, le=1.0, alias="masteryScore")

# 2. Teacher
class TeacherNode(StandardNodeProperties):
    id: Optional[str] = None
    email: EmailStr
    department: str
    rating: float = Field(default=5.0, ge=0.0, le=5.0)

# 3. Course
class CourseNode(StandardNodeProperties):
    id: Optional[str] = None
    slug: str
    category: str

# 4. Subject
class SubjectNode(StandardNodeProperties):
    id: Optional[str] = None
    course_id: Optional[str] = Field(default=None, alias="courseId")
    order_index: int = Field(default=0, alias="orderIndex")

# 5. Topic
class TopicNode(StandardNodeProperties):
    id: Optional[str] = None
    difficulty_score: float = Field(default=0.5, ge=0.0, le=1.0, alias="difficultyScore")
    key_concepts: List[str] = Field(default_factory=list, alias="keyConcepts")
    order_index: int = Field(default=0, alias="orderIndex")

# 6. Lesson
class LessonNode(StandardNodeProperties):
    id: Optional[str] = None
    duration_seconds: int = Field(default=300, alias="durationSeconds")
    order_index: int = Field(default=0, alias="orderIndex")
    video_url: Optional[str] = Field(default=None, alias="videoUrl")

# 7. Concept
class ConceptNode(StandardNodeProperties):
    subject_area: str = Field(default="Computer Science", alias="subjectArea")
    is_ai_generated: bool = Field(default=False, alias="isAIGenerated")

# 8. Skill
class SkillNode(StandardNodeProperties):
    proficiency_level: float = Field(default=0.0, ge=0.0, le=1.0, alias="proficiencyLevel")

# 9. Quiz
class QuizNode(StandardNodeProperties):
    id: Optional[str] = None
    quiz_type: str = Field(default="practice", alias="quizType")
    time_limit_seconds: int = Field(default=300, alias="timeLimitSeconds")
    passing_score: float = Field(default=70.0, alias="passingScore")

# 10. Question
class QuestionNode(StandardNodeProperties):
    question_text: str = Field(default="", alias="questionText")
    question_type: str = Field(default="mcq", alias="questionType")
    points: int = Field(default=1)

# 11. Resource
class ResourceNode(StandardNodeProperties):
    url: str
    resource_type: str = Field(default="video", alias="resourceType")
    author: Optional[str] = None

# 12. Video
class VideoNode(ResourceNode):
    duration_minutes: Optional[int] = Field(default=10, alias="durationMinutes")

# 13. Book
class BookNode(ResourceNode):
    isbn: Optional[str] = None
    publisher: Optional[str] = None

# 14. Article
class ArticleNode(ResourceNode):
    read_time_minutes: Optional[int] = Field(default=5, alias="readTimeMinutes")

# 15. Assignment
class AssignmentNode(StandardNodeProperties):
    due_date: Optional[datetime] = Field(default=None, alias="dueDate")
    max_points: int = Field(default=100, alias="maxPoints")

# 16. LearningPath
class LearningPathNode(StandardNodeProperties):
    id: Optional[str] = None
    estimated_hours: float = Field(default=10.0, alias="estimatedHours")
    is_ai_generated: bool = Field(default=True, alias="isAIGenerated")

# 17. Recommendation
class RecommendationNode(StandardNodeProperties):
    reason: str = Field(default="")
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)

# 18. StudyGoal
class StudyGoalNode(StandardNodeProperties):
    target_value: float = Field(default=10.0, alias="targetValue")
    current_value: float = Field(default=0.0, alias="currentValue")
    unit: str = Field(default="hours")

# 19. WeakConcept
class WeakConceptNode(StandardNodeProperties):
    concept_name: str = Field(..., alias="conceptName")
    failure_count: int = Field(default=1, alias="failureCount")
    is_resolved: bool = Field(default=False, alias="isResolved")
