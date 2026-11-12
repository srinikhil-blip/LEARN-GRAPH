"""
LearnGraph — Hybrid Query Aggregator Service
Combines PostgreSQL ACID relational data (profiles, enrolled courses, quiz grades)
with Neo4j semantic graph traversals (prerequisite closure, learning frontiers, weak root analysis)
backed by Redis multi-tiered caching.
"""

import json
from typing import Any, Dict, List, Optional
from uuid import UUID

import structlog
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.graph.session import graph_manager
from app.models.course import Course
from app.models.enrollment import ConceptMastery, CourseEnrollment
from app.models.quiz_result import QuizResult
from app.models.student_profile import StudentProfile
from app.models.user import User
from app.workers.redis_client import redis_manager

logger = structlog.get_logger(__name__)


class HybridQueryService:
    """
    Executes high-performance hybrid queries across PostgreSQL, Neo4j, and Redis.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.graph = graph_manager
        self.redis = redis_manager

    async def get_student_hybrid_dashboard(self, student_id: UUID) -> Dict[str, Any]:
        """
        Produce a unified dashboard view by merging:
        - Relational data from PostgreSQL (User details, Enrollment stats, Quiz scores)
        - Graph traversal from Neo4j (Next learning frontier, weak concept prerequisite roots)
        - Multi-tier caching in Redis (TTL: 300 seconds)
        """
        cache_key = f"cache:student:hybrid_dashboard:{student_id}"

        # 1. Try Redis cache
        try:
            cached_json = await self.redis.get(cache_key)
            if cached_json:
                return json.loads(cached_json)
        except Exception as exc:
            logger.warning("hybrid.cache_read_skipped", error=str(exc))

        # 2. Query PostgreSQL for Relational Data
        # User & Profile
        user_query = (
            select(User, StudentProfile)
            .outerjoin(StudentProfile, User.id == StudentProfile.user_id)
            .where(User.id == student_id)
        )
        res = await self.session.execute(user_query)
        row = res.first()
        if not row:
            return {"error": "Student not found"}
        user, profile = row

        # Recent Quiz Results
        quiz_query = (
            select(QuizResult)
            .where(QuizResult.student_id == student_id)
            .order_by(desc(QuizResult.created_at))
            .limit(5)
        )
        quiz_res = await self.session.execute(quiz_query)
        recent_quizzes = [
            {
                "id": str(q.id),
                "score": float(q.score),
                "percentage": float(q.percentage),
                "passed": q.passed,
                "created_at": q.created_at.isoformat() if q.created_at else None,
            }
            for q in quiz_res.scalars().all()
        ]

        # Enrolled Courses Count
        enrollment_query = (
            select(func.count(CourseEnrollment.id))
            .where(CourseEnrollment.student_id == student_id)
        )
        enroll_res = await self.session.execute(enrollment_query)
        enrolled_count = enroll_res.scalar() or 0

        # 3. Query Neo4j for Graph Insights (Personalized Frontier & Prerequisite Roots)
        # Frontier Cypher: Find concepts whose prerequisites are ALL mastered by this student, but student has not mastered yet
        frontier_cypher = """
        MATCH (s:Student {uuid: $student_id})
        MATCH (c:Concept)
        WHERE NOT (s)-[:MASTERED]->(c)
          AND ALL(p IN [(p)-[:PREREQUISITE]->(c) | p] WHERE (s)-[:MASTERED]->(p))
        RETURN c.uuid AS concept_id, c.name AS name, c.description AS description
        LIMIT 5
        """
        frontier_records = []
        try:
            records = await self.graph.execute_read(frontier_cypher, {"student_id": str(student_id)})
            frontier_records = [
                {
                    "concept_id": r["concept_id"],
                    "name": r["name"],
                    "description": r.get("description", ""),
                }
                for r in records
            ]
        except Exception as exc:
            logger.error("hybrid.neo4j_frontier_failed", error=str(exc))

        # Weak Concept Root Diagnosis Cypher:
        # Find weak concepts and trace backwards to identify which root prerequisite caused the gap
        weak_root_cypher = """
        MATCH (s:Student {uuid: $student_id})-[w:WEAK_AT]->(weak:Concept)
        OPTIONAL MATCH (root:Concept)-[:PREREQUISITE*1..3]->(weak)
        WHERE NOT (s)-[:MASTERED]->(root)
        RETURN weak.uuid AS weak_id, weak.name AS weak_name,
               collect(DISTINCT {root_id: root.uuid, root_name: root.name}) AS missing_prerequisites
        LIMIT 3
        """
        weak_roots = []
        try:
            records = await self.graph.execute_read(weak_root_cypher, {"student_id": str(student_id)})
            weak_roots = [
                {
                    "weak_concept_id": r["weak_id"],
                    "weak_concept_name": r["weak_name"],
                    "missing_prerequisites": [
                        p for p in r["missing_prerequisites"] if p.get("root_id")
                    ],
                }
                for r in records
            ]
        except Exception as exc:
            logger.error("hybrid.neo4j_weak_roots_failed", error=str(exc))

        # 4. Assemble Hybrid DTO
        dashboard_data = {
            "student": {
                "id": str(user.id),
                "full_name": user.full_name,
                "email": user.email,
                "level": profile.current_level if profile else 1,
                "xp_points": profile.xp_points if profile else 0,
                "streak_days": profile.streak_days if profile else 0,
                "enrolled_courses": enrolled_count,
            },
            "recent_quizzes": recent_quizzes,
            "knowledge_graph": {
                "next_recommended_frontier": frontier_records,
                "root_cause_weak_concepts": weak_roots,
            },
        }

        # 5. Store in Redis with 300s TTL
        try:
            await self.redis.setex(cache_key, 300, json.dumps(dashboard_data))
        except Exception as exc:
            logger.warning("hybrid.cache_write_skipped", error=str(exc))

        return dashboard_data
