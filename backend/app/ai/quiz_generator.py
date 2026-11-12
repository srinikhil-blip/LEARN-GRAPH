"""
AI-powered quiz generation service for LearnGraph.

QuizGenerator produces validated, structured quiz objects from GPT-4o.
It supports both on-demand topic-based generation and adaptive generation
that tailors difficulty to a student's quiz history.
"""

from __future__ import annotations

import json
import logging
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.ai.base import BaseAIService
from app.core.exceptions import AIServiceError

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

QuestionType = Literal[
    "multiple_choice",
    "true_false",
    "short_answer",
    "fill_in_the_blank",
    "matching",
]

DifficultyLevel = Literal["beginner", "intermediate", "advanced", "expert"]


class GeneratedQuestion(BaseModel):
    """A single generated quiz question with answer and metadata."""

    question_text: str = Field(..., description="The question posed to the student")
    question_type: QuestionType
    options: list[str] = Field(
        default_factory=list,
        description="Answer choices (required for multiple_choice, matching)",
    )
    correct_answer: str = Field(..., description="The correct answer or answer key")
    explanation: str = Field(
        ..., description="Why the correct answer is correct (shown after submission)"
    )
    difficulty: DifficultyLevel = Field(default="intermediate")
    concept_tested: str = Field(
        ..., description="The core concept this question evaluates"
    )
    hints: list[str] = Field(
        default_factory=list,
        description="Optional progressive hints (1-3 items)",
    )

    @field_validator("options")
    @classmethod
    def validate_options(cls, v: list[str], info: object) -> list[str]:  # noqa: ARG002
        return [opt.strip() for opt in v if opt.strip()]


class GeneratedQuiz(BaseModel):
    """A complete AI-generated quiz."""

    title: str
    topic: str
    difficulty: DifficultyLevel
    estimated_minutes: int = Field(default=10, ge=1)
    questions: list[GeneratedQuestion]
    learning_objectives: list[str] = Field(default_factory=list)

    @field_validator("questions")
    @classmethod
    def at_least_one_question(cls, v: list[GeneratedQuestion]) -> list[GeneratedQuestion]:
        if not v:
            raise ValueError("A quiz must contain at least one question")
        return v


# ---------------------------------------------------------------------------
# System prompt template
# ---------------------------------------------------------------------------

_QUIZ_SYSTEM_PROMPT = """\
You are an expert educational assessment designer specialising in adaptive learning.
Generate high-quality quiz questions that accurately test student understanding.

Respond with VALID JSON matching this exact schema:
{
  "title": "string",
  "topic": "string",
  "difficulty": "beginner|intermediate|advanced|expert",
  "estimated_minutes": integer,
  "questions": [
    {
      "question_text": "string",
      "question_type": "multiple_choice|true_false|short_answer|fill_in_the_blank|matching",
      "options": ["string"],
      "correct_answer": "string",
      "explanation": "string",
      "difficulty": "beginner|intermediate|advanced|expert",
      "concept_tested": "string",
      "hints": ["string"]
    }
  ],
  "learning_objectives": ["string"]
}

Rules:
- multiple_choice: provide exactly 4 options (A–D format: "A. Option text").
- true_false: options must be ["True", "False"].
- short_answer / fill_in_the_blank: options should be [].
- Explanations must be educational (2-3 sentences minimum).
- Each question must test a distinct concept.
- Hints must not reveal the answer directly.
"""


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class QuizGenerator(BaseAIService):
    """
    AI quiz generation service.

    Supports on-demand generation by topic and adaptive generation
    driven by a student's performance history and weak concepts.
    """

    async def generate_quiz(
        self,
        topic: str,
        difficulty: DifficultyLevel = "intermediate",
        num_questions: int = 10,
        question_types: list[QuestionType] | None = None,
        student_weak_concepts: list[str] | None = None,
        content_context: str | None = None,
    ) -> GeneratedQuiz:
        """
        Generate a quiz on *topic* with the specified parameters.

        Args:
            topic: The subject matter of the quiz.
            difficulty: Target difficulty level.
            num_questions: How many questions to generate (1-30).
            question_types: Subset of question types to include; all if ``None``.
            student_weak_concepts: Concepts to emphasise in the quiz.
            content_context: Optional source content to base questions on.

        Returns:
            A validated :class:`GeneratedQuiz` instance.
        """
        num_questions = max(1, min(num_questions, 30))
        types_str = (
            ", ".join(question_types)
            if question_types
            else "multiple_choice, true_false, short_answer"
        )

        weak_section = ""
        if student_weak_concepts:
            weak_section = (
                f"\n\nIMPORTANT — The student struggles with these concepts. "
                f"Include AT LEAST {min(len(student_weak_concepts), num_questions // 2 + 1)} "
                f"questions targeting them:\n"
                + "\n".join(f"  • {c}" for c in student_weak_concepts)
            )

        context_section = ""
        if content_context:
            context_section = (
                f"\n\nBase questions on the following content:\n{content_context[:3000]}"
            )

        user_prompt = (
            f"Generate a {difficulty} quiz on '{topic}'.\n"
            f"Number of questions: {num_questions}\n"
            f"Question types to use: {types_str}"
            f"{weak_section}"
            f"{context_section}"
        )

        messages = [
            {"role": "system", "content": _QUIZ_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        raw = await self._call_openai(
            messages=messages,
            model="gpt-4o",
            max_tokens=4096,
            temperature=0.6,
            response_format={"type": "json_object"},
        )

        return self._parse_quiz(raw)

    async def generate_adaptive_quiz(
        self,
        student_id: str,
        quiz_history: list[dict],
        weak_concepts: list[str],
        num_questions: int = 10,
    ) -> GeneratedQuiz:
        """
        Generate an adaptive quiz tuned to a student's performance history.

        Analyses recent quiz results to determine appropriate difficulty,
        then focuses the quiz heavily on detected weak concepts.

        Args:
            student_id: Unique identifier of the student (used for logging).
            quiz_history: List of previous quiz result dicts, each with
                keys ``topic``, ``score`` (0-1), ``difficulty``, and
                optionally ``wrong_concepts``.
            weak_concepts: Pre-identified weak concept names.
            num_questions: Total questions to generate.

        Returns:
            Validated :class:`GeneratedQuiz` adapted to the student.
        """
        # Determine adaptive difficulty from recent scores
        adaptive_difficulty = self._infer_difficulty(quiz_history)

        # Identify the most common topic from history
        topics = [q.get("topic", "") for q in quiz_history if q.get("topic")]
        primary_topic = max(set(topics), key=topics.count) if topics else "Mixed Topics"

        history_summary = self._summarize_history(quiz_history)

        user_prompt = (
            f"Generate an ADAPTIVE quiz for student {student_id}.\n\n"
            f"Performance summary:\n{history_summary}\n\n"
            f"Recommended difficulty: {adaptive_difficulty}\n"
            f"Primary topic: {primary_topic}\n"
            f"Number of questions: {num_questions}\n\n"
            f"CRITICAL — The student has identified weaknesses in these areas. "
            f"At least 60% of questions MUST target them:\n"
            + "\n".join(f"  • {c}" for c in weak_concepts)
            + "\n\nFocus on reinforcing fundamentals for weak areas, "
            "and include some harder questions on stronger areas to maintain engagement."
        )

        messages = [
            {"role": "system", "content": _QUIZ_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]

        raw = await self._call_openai(
            messages=messages,
            model="gpt-4o",
            max_tokens=4096,
            temperature=0.5,
            response_format={"type": "json_object"},
        )

        quiz = self._parse_quiz(raw)
        logger.info(
            "Adaptive quiz generated",
            extra={
                "student_id": student_id,
                "difficulty": adaptive_difficulty,
                "question_count": len(quiz.questions),
            },
        )
        return quiz

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _parse_quiz(self, raw: str) -> GeneratedQuiz:
        """Parse and validate a JSON string into a :class:`GeneratedQuiz`."""
        try:
            data = json.loads(raw)
            return GeneratedQuiz.model_validate(data)
        except (json.JSONDecodeError, ValueError) as exc:
            logger.error("Failed to parse generated quiz: %s", exc)
            raise AIServiceError(f"Quiz generator returned invalid JSON: {exc}") from exc

    @staticmethod
    def _infer_difficulty(history: list[dict]) -> DifficultyLevel:
        """
        Determine recommended difficulty from recent quiz scores.

        Uses the average score of the last 5 quizzes:
        - < 0.4  → beginner
        - < 0.65 → intermediate
        - < 0.85 → advanced
        - else   → expert
        """
        recent = history[-5:] if len(history) >= 5 else history
        if not recent:
            return "intermediate"

        scores = [float(q.get("score", 0.5)) for q in recent]
        avg = sum(scores) / len(scores)

        if avg < 0.4:
            return "beginner"
        if avg < 0.65:
            return "intermediate"
        if avg < 0.85:
            return "advanced"
        return "expert"

    @staticmethod
    def _summarize_history(history: list[dict]) -> str:
        """Format quiz history into a readable summary string for the prompt."""
        if not history:
            return "No quiz history available."

        lines: list[str] = []
        for q in history[-5:]:
            score_pct = int(float(q.get("score", 0)) * 100)
            lines.append(
                f"  • Topic: {q.get('topic', 'Unknown')} | "
                f"Score: {score_pct}% | "
                f"Difficulty: {q.get('difficulty', 'intermediate')}"
            )
        return "\n".join(lines)
