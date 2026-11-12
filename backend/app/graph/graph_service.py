"""
LearnGraph — Neo4j Knowledge Graph Service
Comprehensive graph operations: node creation, prerequisite traversal,
weak concept detection, and student knowledge topology generation for React Flow.
"""

from typing import Any, Dict, List, Optional
from uuid import UUID
import structlog

from app.core.exceptions import GraphError
from app.graph.node_models import ConceptNode, CourseNode, StudentNode, TopicNode
from app.graph.session import graph_manager

logger = structlog.get_logger(__name__)


class GraphService:
    """High-level service coordinating graph operations on Neo4j AuraDB."""

    def __init__(self) -> None:
        self._manager = graph_manager

    # ── Node Management ───────────────────────────────────────────────────────

    async def create_student(self, student: StudentNode) -> None:
        """Create or update a student node in the knowledge graph."""
        cypher = """
        MERGE (s:Student {uuid: $uuid})
        ON CREATE SET s.id = $uuid,
                      s.email = $email,
                      s.name = $name,
                      s.level = $level,
                      s.xpPoints = $xp_points,
                      s.masteryScore = $mastery_score,
                      s.createdAt = datetime(),
                      s.updatedAt = datetime(),
                      s.status = "active"
        ON MATCH SET s.name = $name,
                     s.level = $level,
                     s.xpPoints = $xp_points,
                     s.masteryScore = $mastery_score,
                     s.updatedAt = datetime()
        """
        params = student.model_dump()
        if "uuid" not in params or not params["uuid"]:
            params["uuid"] = str(student.id) if student.id else "s-default"
        await self._manager.execute_write(cypher, params)

    async def create_course(self, course: CourseNode) -> None:
        """Create or update a course node."""
        cypher = """
        MERGE (c:Course {uuid: $uuid})
        SET c.id = $uuid,
            c.name = $name,
            c.title = $name,
            c.slug = $slug,
            c.difficulty = $difficulty,
            c.category = $category,
            c.updatedAt = datetime()
        """
        params = course.model_dump()
        if "uuid" not in params or not params["uuid"]:
            params["uuid"] = str(course.id) if course.id else params.get("slug", "c-default")
        if "name" not in params:
            params["name"] = params.get("title", "Course")
        await self._manager.execute_write(cypher, params)

    async def create_topic(self, topic: TopicNode) -> None:
        """Create a topic node and link to its concepts."""
        cypher = """
        MERGE (t:Topic {uuid: $uuid})
        SET t.id = $uuid,
            t.name = $name,
            t.title = $name,
            t.difficulty = $difficulty,
            t.difficultyScore = $difficulty_score,
            t.keyConcepts = $key_concepts,
            t.updatedAt = datetime()
        """
        params = topic.model_dump()
        if "uuid" not in params or not params["uuid"]:
            params["uuid"] = str(topic.id) if topic.id else "t-default"
        if "name" not in params:
            params["name"] = params.get("title", "Topic")
        await self._manager.execute_write(cypher, params)

    async def create_concept(self, concept: ConceptNode) -> None:
        """Create or update a fine-grained concept node."""
        cypher = """
        MERGE (c:Concept {uuid: $uuid})
        SET c.name = $name,
            c.description = $description,
            c.subjectArea = $subject_area,
            c.isAIGenerated = $is_ai_generated,
            c.updatedAt = datetime()
        """
        params = concept.model_dump()
        if "uuid" not in params or not params["uuid"]:
            params["uuid"] = f"con-{concept.name.lower().replace(' ', '-')}"
        await self._manager.execute_write(cypher, params)

    # ── Mastery & State Machine Updates ───────────────────────────────────────

    async def mark_topic_mastered(
        self, student_id: UUID, topic_id: UUID, score: float = 1.0
    ) -> None:
        """Mark a topic as mastered by student, deleting weak relationship if present."""
        cypher = """
        MATCH (s:Student) WHERE s.uuid = $student_id OR s.id = $student_id
        MATCH (t:Topic) WHERE t.uuid = $topic_id OR t.id = $topic_id
        OPTIONAL MATCH (s)-[w:WEAK_AT]->(t)
        DELETE w
        OPTIONAL MATCH (s)-[l:LEARNING]->(t)
        DELETE l
        MERGE (s)-[m:MASTERED]->(t)
        SET m.score = $score,
            m.confidence = 0.95,
            m.strength = 1.0,
            m.updatedAt = datetime()
        """
        await self._manager.execute_write(
            cypher, {"student_id": str(student_id), "topic_id": str(topic_id), "score": score}
        )

    async def mark_topic_weak(
        self, student_id: UUID, topic_id: UUID, failure_count: int = 1
    ) -> None:
        """Flag a topic as weak for a student."""
        cypher = """
        MATCH (s:Student) WHERE s.uuid = $student_id OR s.id = $student_id
        MATCH (t:Topic) WHERE t.uuid = $topic_id OR t.id = $topic_id
        OPTIONAL MATCH (s)-[m:MASTERED]->(t)
        DELETE m
        MERGE (s)-[w:WEAK_AT]->(t)
        SET w.failureCount = coalesce(w.failureCount, 0) + $failure_count,
            w.confidence = 0.90,
            w.strength = 0.85,
            w.updatedAt = datetime()
        """
        await self._manager.execute_write(
            cypher,
            {"student_id": str(student_id), "topic_id": str(topic_id), "failure_count": failure_count},
        )

    async def mark_topic_learning(self, student_id: UUID, topic_id: UUID) -> None:
        """Record that a student is actively studying a topic."""
        cypher = """
        MATCH (s:Student) WHERE s.uuid = $student_id OR s.id = $student_id
        MATCH (t:Topic) WHERE t.uuid = $topic_id OR t.id = $topic_id
        MERGE (s)-[l:LEARNING]->(t)
        SET l.updatedAt = datetime()
        """
        await self._manager.execute_write(
            cypher, {"student_id": str(student_id), "topic_id": str(topic_id)}
        )

    async def add_prerequisite(
        self, topic_id: UUID, prerequisite_topic_id: UUID
    ) -> None:
        """Specify that topic B is a prerequisite for topic A."""
        cypher = """
        MATCH (t:Topic) WHERE t.uuid = $topic_id OR t.id = $topic_id
        MATCH (p:Topic) WHERE p.uuid = $prereq_id OR p.id = $prereq_id
        MERGE (p)-[r:PREREQUISITE]->(t)
        SET r.strength = 0.95,
            r.confidence = 0.98,
            r.weight = 1.0,
            r.updatedAt = datetime()
        """
        await self._manager.execute_write(
            cypher, {"topic_id": str(topic_id), "prereq_id": str(prerequisite_topic_id)}
        )

    # ── Production Graph Queries ──────────────────────────────────────────────

    async def find_prerequisites(self, concept_uuid: str) -> List[Dict[str, Any]]:
        """1. Find prerequisite concepts (direct & multi-hop)."""
        cypher = """
        MATCH path = (p:Concept)-[:PREREQUISITE*1..3]->(target:Concept {uuid: $concept_uuid})
        RETURN DISTINCT p.uuid AS prerequisite_id,
               p.name AS prerequisite_name,
               p.difficulty AS difficulty,
               length(path) AS distance
        ORDER BY distance DESC, p.difficulty ASC;
        """
        return await self._manager.execute_query(cypher, {"concept_uuid": concept_uuid})

    async def find_weak_concepts(self, student_uuid: str) -> List[Dict[str, Any]]:
        """2. Find weak concepts for a given student."""
        cypher = """
        MATCH (s:Student) WHERE s.uuid = $student_uuid OR s.id = $student_uuid
        MATCH (s)-[w:WEAK_AT]->(c:Concept)
        RETURN c.uuid AS concept_id,
               c.name AS concept_name,
               c.subjectArea AS subject_area,
               w.failureCount AS failure_count,
               w.confidence AS weakness_confidence
        ORDER BY w.failureCount DESC;
        """
        return await self._manager.execute_query(cypher, {"student_uuid": student_uuid})

    async def generate_personalized_learning_path(
        self, student_uuid: str, target_concept_uuid: str
    ) -> List[Dict[str, Any]]:
        """3. Generate personalized learning path."""
        cypher = """
        MATCH (target:Concept {uuid: $target_concept_uuid})
        MATCH path = (prereq:Concept)-[:PREREQUISITE*0..4]->(target)
        WHERE NOT (:Student {uuid: $student_uuid})-[:MASTERED]->(prereq)
        WITH prereq, length(path) AS depth, prereq.difficulty AS difficulty
        ORDER BY depth DESC, difficulty ASC
        RETURN DISTINCT prereq.uuid AS step_id,
               prereq.name AS concept_name,
               prereq.difficulty AS difficulty,
               prereq.estimatedLearningTime AS estimated_minutes,
               depth AS topological_order;
        """
        return await self._manager.execute_query(
            cypher, {"student_uuid": student_uuid, "target_concept_uuid": target_concept_uuid}
        )

    async def find_learning_bottlenecks(self) -> List[Dict[str, Any]]:
        """9. Find learning bottlenecks (high in-degree prerequisite nodes)."""
        cypher = """
        MATCH (bottleneck:Concept)<-[:PREREQUISITE]-(downstream:Concept)
        WITH bottleneck, count(downstream) AS blocked_count
        WHERE blocked_count >= 2
        RETURN bottleneck.uuid AS concept_id,
               bottleneck.name AS bottleneck_concept,
               bottleneck.subjectArea AS subject_area,
               blocked_count
        ORDER BY blocked_count DESC;
        """
        return await self._manager.execute_query(cypher, {})

    async def find_shortest_learning_path(
        self, source_uuid: str, target_uuid: str
    ) -> List[Dict[str, Any]]:
        """7. Find shortest learning path between concepts."""
        cypher = """
        MATCH (source:Concept {uuid: $source_uuid}), (target:Concept {uuid: $target_uuid})
        MATCH p = shortestPath((source)-[:PREREQUISITE|DEPENDS_ON*..8]->(target))
        RETURN [n IN nodes(p) | {uuid: n.uuid, name: n.name, difficulty: n.difficulty}] AS path_nodes,
               length(p) AS hops;
        """
        return await self._manager.execute_query(
            cypher, {"source_uuid": source_uuid, "target_uuid": target_uuid}
        )

    # ── React Flow Interactive Graph Topology ─────────────────────────────────

    async def get_student_knowledge_graph(
        self, student_id: UUID
    ) -> Dict[str, Any]:
        """
        Generate React Flow-compatible knowledge graph for the student.
        Color Specs:
          - Green (#10b981) = Mastered
          - Yellow (#f59e0b) = Learning
          - Red (#ef4444) = Weak
          - Blue (#3b82f6) = Recommended
          - Purple (#8b5cf6) = AI Generated
        """
        cypher = """
        MATCH (t:Topic)
        OPTIONAL MATCH (s:Student)-[m:MASTERED]->(t) WHERE s.uuid = $sid OR s.id = $sid
        OPTIONAL MATCH (s:Student)-[w:WEAK_AT]->(t) WHERE s.uuid = $sid OR s.id = $sid
        OPTIONAL MATCH (s:Student)-[l:LEARNING]->(t) WHERE s.uuid = $sid OR s.id = $sid
        OPTIONAL MATCH (p:Topic)-[r:PREREQUISITE]->(t)
        RETURN coalesce(t.uuid, t.id) AS id,
               coalesce(t.name, t.title) AS title,
               t.difficulty AS difficulty,
               t.isAIGenerated AS is_ai_generated,
               CASE
                 WHEN t.isAIGenerated = true THEN 'ai_generated'
                 WHEN m IS NOT NULL THEN 'mastered'
                 WHEN w IS NOT NULL THEN 'weak'
                 WHEN l IS NOT NULL THEN 'learning'
                 ELSE 'recommended'
               END AS status,
               coalesce(m.score, 0.0) AS score,
               collect(coalesce(p.uuid, p.id)) AS prerequisites
        """
        records = await self._manager.execute_query(cypher, {"sid": str(student_id)})

        color_palette = {
            "mastered": "#10b981",      # Green
            "learning": "#f59e0b",      # Yellow
            "weak": "#ef4444",          # Red
            "recommended": "#3b82f6",   # Blue
            "ai_generated": "#8b5cf6",  # Purple
        }

        nodes = []
        edges = []

        for i, rec in enumerate(records):
            node_id = str(rec["id"])
            status = rec["status"]
            nodes.append({
                "id": node_id,
                "label": rec["title"],
                "node_type": "topic",
                "status": status,
                "color": color_palette.get(status, "#3b82f6"),
                "mastery_score": rec["score"],
                "x": 100 + (i % 4) * 240,
                "y": 100 + (i // 4) * 180,
                "metadata": {
                    "difficulty": rec.get("difficulty", "intermediate"),
                    "isAIGenerated": rec.get("is_ai_generated", False),
                },
            })

            for prereq_id in rec.get("prerequisites", []):
                if prereq_id and str(prereq_id) != "None":
                    edges.append({
                        "id": f"e-{prereq_id}-{node_id}",
                        "source": str(prereq_id),
                        "target": node_id,
                        "edge_type": "PREREQUISITE",
                        "label": "requires",
                    })

        return {
            "nodes": nodes,
            "edges": edges,
            "metadata": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "student_id": str(student_id),
            },
        }

    async def get_recommended_next_topics(
        self, student_id: UUID, limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Find unlocked topics where all prerequisites are mastered."""
        cypher = """
        MATCH (t:Topic)
        WHERE NOT (:Student {uuid: $sid})-[:MASTERED]->(t)
          AND NOT (:Student {id: $sid})-[:MASTERED]->(t)
        OPTIONAL MATCH (p:Topic)-[:PREREQUISITE]->(t)
        WITH t, count(p) AS total_prereqs,
             count { MATCH (s:Student)-[:MASTERED]->(p) WHERE s.uuid = $sid OR s.id = $sid } AS mastered_prereqs
        WHERE total_prereqs = mastered_prereqs
        RETURN coalesce(t.uuid, t.id) AS id,
               coalesce(t.name, t.title) AS title,
               t.difficulty AS difficulty
        LIMIT $limit;
        """
        records = await self._manager.execute_query(cypher, {"sid": str(student_id), "limit": limit})
        return [
            {
                "id": rec["id"],
                "title": rec["title"],
                "reason": "All prerequisite concepts mastered",
                "confidence": 0.95,
                "prerequisites_met": True,
            }
            for rec in records
        ]

    async def get_graph_analytics(self, student_id: UUID) -> Dict[str, Any]:
        """Calculate graph-level student mastery and concept counts."""
        cypher = """
        MATCH (t:Topic)
        OPTIONAL MATCH (s:Student)-[m:MASTERED]->(t) WHERE s.uuid = $sid OR s.id = $sid
        OPTIONAL MATCH (s:Student)-[w:WEAK_AT]->(t) WHERE s.uuid = $sid OR s.id = $sid
        OPTIONAL MATCH (s:Student)-[l:LEARNING]->(t) WHERE s.uuid = $sid OR s.id = $sid
        RETURN count(t) AS total_topics,
               count(m) AS mastered_count,
               count(w) AS weak_count,
               count(l) AS learning_count
        """
        records = await self._manager.execute_query(cypher, {"sid": str(student_id)})
        if not records:
            return {
                "mastered_count": 0,
                "learning_count": 0,
                "weak_count": 0,
                "total_concepts": 0,
                "completion_pct": 0.0,
            }

        rec = records[0]
        total = max(1, rec["total_topics"] or 1)
        mastered = rec["mastered_count"] or 0
        return {
            "mastered_count": mastered,
            "learning_count": rec["learning_count"] or 0,
            "weak_count": rec["weak_count"] or 0,
            "total_concepts": total,
            "completion_pct": round((mastered / total) * 100.0, 1),
        }
