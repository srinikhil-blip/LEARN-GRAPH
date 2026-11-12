"""
LearnGraph — Graph API Response Schemas
Pydantic v2 models for all Knowledge Graph HTTP responses.
"""

from typing import Any

from pydantic import BaseModel, Field


# ── Base Config ───────────────────────────────────────────────────────────────

class _BaseSchema(BaseModel):
    model_config = {"from_attributes": True}


# ── Graph Primitives ──────────────────────────────────────────────────────────

class GraphNode(_BaseSchema):
    """
    A single node in the visualised knowledge graph.

    ``status`` encodes the student's current relationship with this node:
    - ``mastered``:    Student has achieved a passing mastery score.
    - ``learning``:    Student is actively studying this topic.
    - ``weak``:        Student has repeatedly failed assessments for this topic.
    - ``recommended``: AI-recommended as the best next topic to study.
    - ``locked``:      Prerequisites not yet met.
    - ``unknown``:     No relationship exists yet.
    """

    id: str = Field(..., description="Node identifier (UUID or concept name)")
    label: str = Field(..., description="Human-readable display label")
    node_type: str = Field(
        ...,
        description="Graph node label: Student | Topic | Concept | Skill | Course | Subject | Quiz",
    )
    status: str = Field(
        default="unknown",
        description="mastered | learning | weak | recommended | locked | unknown",
    )
    mastery_score: float = Field(
        default=0.0, ge=0.0, le=1.0, description="Current mastery score (0–1)"
    )
    x: float | None = Field(default=None, description="Optional X coordinate for layout")
    y: float | None = Field(default=None, description="Optional Y coordinate for layout")
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Extra node properties (difficulty_score, key_concepts, …)",
    )


class GraphEdge(_BaseSchema):
    """A directed relationship between two nodes in the knowledge graph."""

    id: str = Field(..., description="Synthetic edge identifier (source__type__target)")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    edge_type: str = Field(
        ...,
        description=(
            "Relationship type: MASTERED | STUDENT_WEAK_AT | CURRENTLY_LEARNING | "
            "PREREQUISITE_OF | PART_OF | TESTS_CONCEPT | RELATED_TO | HAS_SKILL"
        ),
    )
    weight: float = Field(default=1.0, description="Relationship strength / score")
    label: str = Field(default="", description="Display label for the edge")


class GraphResponse(_BaseSchema):
    """Full knowledge graph payload returned to the client."""

    nodes: list[GraphNode] = Field(default_factory=list)
    edges: list[GraphEdge] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Graph-level metadata: node_count, edge_count, generated_at, …",
    )


# ── Analytics ─────────────────────────────────────────────────────────────────

class GraphAnalytics(_BaseSchema):
    """Aggregated statistics derived from the student's knowledge graph."""

    mastered_count: int = Field(..., ge=0, description="Topics fully mastered")
    learning_count: int = Field(..., ge=0, description="Topics currently in progress")
    weak_count: int = Field(..., ge=0, description="Topics identified as weak")
    total_concepts: int = Field(..., ge=0, description="Total concepts in the graph")
    completion_pct: float = Field(
        ..., ge=0.0, le=100.0, description="Overall course completion percentage"
    )
    strongest_area: str | None = Field(
        default=None, description="Subject area with highest average mastery"
    )
    weakest_area: str | None = Field(
        default=None, description="Subject area with lowest average mastery"
    )


# ── Topic Neighbourhood ───────────────────────────────────────────────────────

class TopicNeighborhood(_BaseSchema):
    """
    Ego-graph centred on a single topic node.

    Contains the focal topic plus all nodes reachable within *depth* hops,
    along with the edges that connect them.
    """

    center_node: GraphNode
    nodes: list[GraphNode] = Field(default_factory=list)
    edges: list[GraphEdge] = Field(default_factory=list)
    depth: int = Field(..., ge=1, description="Number of hops explored from the centre")


# ── Recommendations ───────────────────────────────────────────────────────────

class RecommendedTopic(_BaseSchema):
    """
    A single topic recommended as the student's next learning target.
    """

    id: str = Field(..., description="Topic UUID")
    title: str = Field(..., description="Topic title")
    reason: str = Field(..., description="Human-readable explanation for the recommendation")
    confidence: float = Field(
        ..., ge=0.0, le=1.0, description="Model confidence score (0–1)"
    )
    prerequisites_met: bool = Field(
        ..., description="True when all prerequisite topics are already mastered"
    )
    difficulty_score: float = Field(
        default=0.0, ge=0.0, le=1.0, description="Topic difficulty score"
    )


# ── Learning Path ─────────────────────────────────────────────────────────────

class LearningPathStep(_BaseSchema):
    """A single step within a computed learning path."""

    order: int = Field(..., ge=0, description="Zero-based position in the path")
    topic_id: str
    topic_title: str
    mastery_score: float = Field(default=0.0, ge=0.0, le=1.0)
    status: str = Field(default="unknown")
    estimated_minutes: int = Field(default=0, ge=0)


class LearningPath(_BaseSchema):
    """Shortest learning path from the student's current state to a target topic."""

    student_id: str
    target_topic_id: str
    target_topic_title: str
    steps: list[LearningPathStep] = Field(default_factory=list)
    total_steps: int = Field(default=0, ge=0)
    estimated_hours: float = Field(default=0.0, ge=0.0)
