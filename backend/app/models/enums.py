"""
LearnGraph — Shared Enumerations
All Python Enum classes used across ORM models are centralised here.
Import from this module to avoid circular dependencies.
"""

import enum


class UserRole(str, enum.Enum):
    """Roles that a platform user can hold."""

    student = "student"
    teacher = "teacher"
    admin = "admin"


class Difficulty(str, enum.Enum):
    """Course-level difficulty tiers."""

    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    expert = "expert"


class CourseStatus(str, enum.Enum):
    """Publication lifecycle of a course."""

    draft = "draft"
    published = "published"
    archived = "archived"


class ContentType(str, enum.Enum):
    """Media format of a topic's primary content."""

    text = "text"
    video = "video"
    pdf = "pdf"
    interactive = "interactive"


class QuizType(str, enum.Enum):
    """Intended purpose / generation strategy of a quiz."""

    practice = "practice"
    assessment = "assessment"
    diagnostic = "diagnostic"
    adaptive = "adaptive"


class QuestionType(str, enum.Enum):
    """Format of an individual quiz question."""

    mcq = "mcq"
    true_false = "true_false"
    short_answer = "short_answer"
    fill_blank = "fill_blank"


class DifficultyLevel(str, enum.Enum):
    """Granular difficulty of a single quiz question."""

    easy = "easy"
    medium = "medium"
    hard = "hard"


class LearningStatus(str, enum.Enum):
    """Progress state of a student on a given topic."""

    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"
    mastered = "mastered"


class WeakConceptSource(str, enum.Enum):
    """How the weak concept was identified."""

    quiz = "quiz"
    self_reported = "self_reported"
    ai_detected = "ai_detected"


class ResourceType(str, enum.Enum):
    """Type of recommended resource."""

    topic = "topic"
    course = "course"
    video = "video"
    book = "book"
    problem = "problem"


class NotificationType(str, enum.Enum):
    """Semantic category of a notification."""

    info = "info"
    success = "success"
    warning = "warning"
    achievement = "achievement"
    reminder = "reminder"
    system = "system"


class SessionType(str, enum.Enum):
    """Purpose / mode of a chat session."""

    general = "general"
    topic_qa = "topic_qa"
    quiz_help = "quiz_help"
    document_qa = "document_qa"


class MessageRole(str, enum.Enum):
    """Speaker role within a chat message."""

    user = "user"
    assistant = "assistant"
    system = "system"


class FileType(str, enum.Enum):
    """Supported upload file formats."""

    pdf = "pdf"
    docx = "docx"
    pptx = "pptx"
    txt = "txt"
    image = "image"


class ProcessingStatus(str, enum.Enum):
    """Pipeline stage of a file being processed by the AI backend."""

    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"


class GoalType(str, enum.Enum):
    """Temporal or outcome type of a study goal."""

    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    course_completion = "course_completion"
    topic_mastery = "topic_mastery"


class LearningStyle(str, enum.Enum):
    """VARK learning-style classification."""

    visual = "visual"
    auditory = "auditory"
    reading = "reading"
    kinesthetic = "kinesthetic"


class RecommendationGenerator(str, enum.Enum):
    """What system generated a recommendation."""

    ai = "ai"
    rule_based = "rule_based"
    teacher = "teacher"
