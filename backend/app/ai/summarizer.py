"""
LearnGraph — Content Summarizer & Flashcard Generator
Creates targeted summaries, explanations, and flashcards from educational material.
"""

import json
from typing import List
from pydantic import BaseModel

from app.ai.base import BaseAIService


class Flashcard(BaseModel):
    front: str
    back: str
    hint: str = ""
    difficulty: str = "medium"


class StudyNotes(BaseModel):
    key_points: List[str]
    definitions: List[str]
    examples: List[str]
    practice_questions: List[str]


class Summarizer(BaseAIService):
    """Summarizes lessons, creates flashcards, and explains challenging concepts."""

    async def summarize_topic(self, topic_content: str, level: str = "intermediate") -> str:
        messages = [
            {
                "role": "system",
                "content": f"You are an expert tutor. Summarize this content clearly for a {level}-level learner.",
            },
            {"role": "user", "content": topic_content},
        ]
        return await self._call_openai(messages, temperature=0.3)

    async def generate_flashcards(self, content: str, num_cards: int = 5) -> List[Flashcard]:
        prompt = f"""
Generate {num_cards} flashcards from this text for spaced repetition:
{content}

Format as a JSON array of objects with keys: "front", "back", "hint", "difficulty" (easy/medium/hard).
"""
        messages = [
            {"role": "system", "content": "You output only valid JSON."},
            {"role": "user", "content": prompt},
        ]
        raw = await self._call_openai(messages, temperature=0.3, response_format={"type": "json_object"})
        try:
            cards = json.loads(raw).get("flashcards", [])
            return [Flashcard(**c) for c in cards]
        except Exception:
            return []

    async def explain_concept(self, concept: str, context: str, student_level: str = "student") -> str:
        prompt = f"""
Explain the concept '{concept}' simply with an intuitive real-world analogy.
Context: {context}
Target audience: {student_level}
"""
        messages = [
            {"role": "system", "content": "You are a warm, encouraging AI tutor."},
            {"role": "user", "content": prompt},
        ]
        return await self._call_openai(messages, temperature=0.4)
