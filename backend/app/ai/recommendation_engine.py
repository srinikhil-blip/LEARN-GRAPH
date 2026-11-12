"""
LearnGraph — AI Recommendation Engine
Synthesizes quiz history, weak concepts, and knowledge graph relationships
to generate hyper-personalized remediation recommendations and learning paths.
"""

import json
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

import structlog

from app.ai.base import BaseAIService

logger = structlog.get_logger(__name__)


class RecommendationItem(BaseModel):
    resource_type: str = Field(description="topic, video, problem, book, course")
    title: str
    description: str
    reason: str
    confidence_score: float = 0.85
    priority: int = 1


class WeakConceptDetection(BaseModel):
    concept_name: str
    subject_area: str
    confidence_score: float
    recommended_action: str


class LearningPathPlan(BaseModel):
    title: str
    estimated_hours: float
    ordered_topics: List[Dict[str, Any]]
    milestones: List[str]


class RecommendationEngine(BaseAIService):
    """Generates tailored educational recommendations and custom learning paths."""

    async def generate_recommendations(
        self,
        student_profile: Dict[str, Any],
        quiz_scores: List[Dict[str, Any]],
        weak_concepts: List[str],
        graph_data: Dict[str, Any],
    ) -> List[RecommendationItem]:
        """Call LLM to synthesize learning gaps into prioritized recommendation items."""
        prompt = f"""
You are an adaptive AI learning architect for LearnGraph.
Analyze this student's profile, recent quiz performance, weak concepts, and knowledge graph:

Student Profile: {json.dumps(student_profile)}
Weak Concepts: {json.dumps(weak_concepts)}
Recent Quizzes: {json.dumps(quiz_scores[-5:] if quiz_scores else [])}

Generate 4 to 6 prioritized, highly actionable learning recommendations.
Format response strictly as a JSON array of objects with keys:
"resource_type" (topic/video/problem/book/course), "title", "description", "reason", "confidence_score" (0.0 to 1.0), "priority" (1 to 5).
"""
        messages = [
            {"role": "system", "content": "You output only valid JSON."},
            {"role": "user", "content": prompt},
        ]
        try:
            raw = await self._call_openai(messages, temperature=0.3, response_format={"type": "json_object"})
            parsed = json.loads(raw)
            items = parsed.get("recommendations", parsed if isinstance(parsed, list) else [])
            if isinstance(items, dict) and "items" in items:
                items = items["items"]
            return [RecommendationItem(**item) for item in items] if isinstance(items, list) else []
        except Exception as e:
            logger.warning("Falling back to rule-based recommendations", error=str(e))
            # Fallback rule-based recommendations
            fallback = []
            for i, wc in enumerate(weak_concepts[:3]):
                fallback.append(
                    RecommendationItem(
                        resource_type="topic",
                        title=f"Review and Practice: {wc}",
                        description=f"Targeted review exercises to reinforce foundational understanding of {wc}.",
                        reason=f"Identified as weak concept from recent assessments",
                        confidence_score=0.9,
                        priority=i + 1,
                    )
                )
            return fallback

    async def detect_weak_concepts(
        self, quiz_results: List[Dict[str, Any]]
    ) -> List[WeakConceptDetection]:
        """Inspect wrong answers across attempts to pinpoint underlying conceptual flaws."""
        if not quiz_results:
            return []

        prompt = f"""
Analyze these quiz question results and extract the exact underlying weak concepts:
{json.dumps(quiz_results)}

Return JSON with key "weak_concepts": list of objects with:
"concept_name", "subject_area", "confidence_score" (0.0-1.0), "recommended_action".
"""
        messages = [
            {"role": "system", "content": "You output only valid JSON with 'weak_concepts' key."},
            {"role": "user", "content": prompt},
        ]
        try:
            raw = await self._call_openai(messages, temperature=0.2, response_format={"type": "json_object"})
            data = json.loads(raw).get("weak_concepts", [])
            return [WeakConceptDetection(**d) for d in data]
        except Exception as e:
            logger.error("Weak concept detection failed", error=str(e))
            return []

    async def generate_learning_path(
        self,
        target_subject: str,
        student_level: int,
        weak_concepts: List[str],
    ) -> LearningPathPlan:
        """Construct a step-by-step roadmap to achieve mastery in target subject."""
        prompt = f"""
Create a personalized learning path to master '{target_subject}'.
Student Level: {student_level}
Current Weak Concepts: {json.dumps(weak_concepts)}

Return JSON with keys:
"title", "estimated_hours", "ordered_topics" (list of objects with "title", "focus", "hours"), "milestones" (list of strings).
"""
        messages = [
            {"role": "system", "content": "You output only valid JSON."},
            {"role": "user", "content": prompt},
        ]
        try:
            raw = await self._call_openai(messages, temperature=0.3, response_format={"type": "json_object"})
            data = json.loads(raw)
            return LearningPathPlan(**data)
        except Exception:
            return LearningPathPlan(
                title=f"Adaptive Path: {target_subject}",
                estimated_hours=12.0,
                ordered_topics=[
                    {"title": f"Core Foundations of {target_subject}", "focus": "Basics", "hours": 3.0},
                    {"title": f"Remediating Weak Concepts", "focus": "Targeted fixes", "hours": 4.0},
                    {"title": f"Advanced Problem Solving", "focus": "Mastery", "hours": 5.0},
                ],
                milestones=["Foundations Verified", "Weaknesses Addressed", "Final Diagnostic Assessment Passed"],
            )
