"""
LearnGraph — Difficulty & Subject Classifier
Evaluates educational content difficulty (0.0 to 1.0) and assigns taxonomy categories.
"""

import json
from typing import List
from pydantic import BaseModel

from app.ai.base import BaseAIService


class DifficultyAnalysis(BaseModel):
    difficulty_score: float  # 0.0 to 1.0
    tier: str                # beginner, intermediate, advanced, expert
    prerequisites_required: List[str]
    rationale: str


class DifficultyAnalyzer(BaseAIService):
    """Calculates complexity scores and categorizes subject matter."""

    async def analyze_difficulty(self, content: str, subject: str = "") -> DifficultyAnalysis:
        prompt = f"""
Evaluate the academic difficulty of this content for {subject}:
{content[:2000]}

Return JSON with keys:
"difficulty_score" (float 0.0 to 1.0),
"tier" ("beginner", "intermediate", "advanced", or "expert"),
"prerequisites_required" (list of strings),
"rationale" (brief explanation).
"""
        messages = [
            {"role": "system", "content": "You output strictly valid JSON."},
            {"role": "user", "content": prompt},
        ]
        try:
            raw = await self._call_openai(messages, temperature=0.1, response_format={"type": "json_object"})
            data = json.loads(raw)
            return DifficultyAnalysis(**data)
        except Exception:
            return DifficultyAnalysis(
                difficulty_score=0.5,
                tier="intermediate",
                prerequisites_required=[],
                rationale="Default estimated difficulty",
            )
