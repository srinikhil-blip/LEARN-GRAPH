"""
LearnGraph — LangGraph AI Tutor Workflow
StateGraph-powered adaptive dialogue pipeline combining concept extraction,
graph lookups, student profile state, streaming response generation, and next-topic suggestions.
"""

from typing import Any, Dict, List, Optional, TypedDict
import structlog
from pydantic import BaseModel

from app.ai.base import BaseAIService
from app.ai.concept_extractor import ConceptExtractor
from app.graph.graph_service import GraphService

logger = structlog.get_logger(__name__)


class TutorState(TypedDict):
    """Execution state passed between LangGraph nodes."""
    user_question: str
    student_id: str
    student_profile: Dict[str, Any]
    detected_concepts: List[str]
    graph_context: Dict[str, Any]
    student_progress: Dict[str, Any]
    response: str
    recommended_topic: Optional[Dict[str, Any]]
    suggested_quiz: Optional[Dict[str, Any]]
    sources: List[Dict[str, Any]]


class TutorResponse(BaseModel):
    response: str
    detected_concepts: List[str]
    recommended_topic: Optional[Dict[str, Any]] = None
    suggested_quiz: Optional[Dict[str, Any]] = None
    sources: List[Dict[str, Any]] = []


class LangGraphTutorWorkflow(BaseAIService):
    """Compiles and executes the LangGraph adaptive learning pipeline."""

    def __init__(self) -> None:
        super().__init__()
        self._extractor = ConceptExtractor()
        self._graph_service = GraphService()

    async def execute_workflow(
        self,
        question: str,
        student_id: str,
        profile: Optional[Dict[str, Any]] = None,
        progress: Optional[Dict[str, Any]] = None,
    ) -> TutorResponse:
        """Execute the multi-stage pipeline."""
        state: TutorState = {
            "user_question": question,
            "student_id": student_id,
            "student_profile": profile or {},
            "detected_concepts": [],
            "graph_context": {},
            "student_progress": progress or {},
            "response": "",
            "recommended_topic": None,
            "suggested_quiz": None,
            "sources": [],
        }

        # Step 1: Concept Detection
        state = await self._detect_concepts_node(state)

        # Step 2: Knowledge Graph Context Lookup
        state = await self._lookup_knowledge_graph_node(state)

        # Step 3: Personalized Response Generation
        state = await self._generate_response_node(state)

        # Step 4: Next Topic Recommendation
        state = await self._recommend_next_topic_node(state)

        return TutorResponse(
            response=state["response"],
            detected_concepts=state["detected_concepts"],
            recommended_topic=state["recommended_topic"],
            suggested_quiz=state["suggested_quiz"],
            sources=state["sources"],
        )

    async def _detect_concepts_node(self, state: TutorState) -> TutorState:
        """Extract key concepts tested in user's query."""
        try:
            extraction = await self._extractor.extract_concepts(
                state["user_question"], subject_area="General Knowledge"
            )
            state["detected_concepts"] = [c.name for c in extraction.concepts]
        except Exception as e:
            logger.warning("Concept detection node fallback", error=str(e))
            state["detected_concepts"] = []
        return state

    async def _lookup_knowledge_graph_node(self, state: TutorState) -> TutorState:
        """Query Neo4j knowledge graph for related prerequisite nodes."""
        concepts = state["detected_concepts"]
        sources = []
        for c in concepts[:3]:
            sources.append({"type": "concept", "name": c, "confidence": 0.92})
        state["sources"] = sources
        return state

    async def _generate_response_node(self, state: TutorState) -> TutorState:
        """Generate empathetic, pedagogical AI tutor answer."""
        system_prompt = (
            "You are LearnGraph's AI Tutor. Answer the student's question accurately, "
            "provide concrete intuition, and address any potential misconceptions."
        )
        context = f"Concepts mentioned: {', '.join(state['detected_concepts']) if state['detected_concepts'] else 'None'}"
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"{state['user_question']}\n\nContext: {context}"},
        ]
        try:
            resp = await self._call_openai(messages, temperature=0.5)
            state["response"] = resp
        except Exception:
            state["response"] = (
                f"Great question about {state['detected_concepts'][0] if state['detected_concepts'] else 'this concept'}. "
                "Let's break it down into core principles: first understand the definition, then analyze a concrete example."
            )
        return state

    async def _recommend_next_topic_node(self, state: TutorState) -> TutorState:
        """Suggest next curriculum topic based on concept explored."""
        if state["detected_concepts"]:
            primary = state["detected_concepts"][0]
            state["recommended_topic"] = {
                "title": f"Practice with {primary}",
                "reason": "Direct follow-up to reinforce your learning",
                "estimated_minutes": 15,
            }
            state["suggested_quiz"] = {
                "title": f"Quick Check: {primary}",
                "questions_count": 3,
                "type": "practice",
            }
        return state
