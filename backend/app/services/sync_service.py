"""
LearnGraph — Hybrid Synchronization Service
Coordinates atomic writes across PostgreSQL and Neo4j via the Transactional Outbox Pattern,
executes idempotent Cypher updates, invalidates Redis caches, and reconciles state drift.
"""

from datetime import UTC, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.graph.session import graph_manager
from app.models.concept import Concept
from app.models.course import Course
from app.models.enrollment import ConceptMastery, CourseEnrollment
from app.models.outbox import OutboxEvent, OutboxEventType, OutboxStatus
from app.models.quiz_result import QuizResult
from app.models.student_profile import StudentProfile
from app.models.topic import Topic
from app.repositories.outbox_repository import OutboxRepository
from app.workers.redis_client import redis_manager

logger = structlog.get_logger(__name__)


class SyncService:
    """
    High-level orchestrator for the dual-database hybrid architecture.
    Bridges relational PostgreSQL ACID guarantees with Neo4j semantic graph traversals.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.outbox_repo = OutboxRepository(session)
        self.graph = graph_manager
        self.redis = redis_manager

    # ── Outbox Batch Processor ────────────────────────────────────────────────

    async def process_batch(self, batch_size: int = 50) -> Dict[str, Any]:
        """
        Drain a batch of pending events using FOR UPDATE SKIP LOCKED.
        Each event is applied to Neo4j idempotently and associated Redis caches are purged.
        """
        events = await self.outbox_repo.fetch_pending_batch(batch_size)
        if not events:
            return {"processed": 0, "failed": 0, "status": "idle"}

        processed_count = 0
        failed_count = 0
        errors: List[Dict[str, str]] = []

        for event in events:
            try:
                await self._apply_event_to_graph(event)
                await self._invalidate_cache(event)
                await self.outbox_repo.mark_published(event.id)
                processed_count += 1
            except Exception as exc:
                failed_count += 1
                error_msg = f"{type(exc).__name__}: {str(exc)}"
                logger.error(
                    "sync.event_processing_error",
                    event_id=str(event.id),
                    event_type=event.event_type,
                    error=error_msg,
                )
                await self.outbox_repo.mark_failed(event.id, error_msg)
                errors.append({"event_id": str(event.id), "error": error_msg})

        await self.session.commit()
        return {
            "processed": processed_count,
            "failed": failed_count,
            "errors": errors,
            "status": "success" if failed_count == 0 else "partial_failure",
        }

    # ── Graph Event Mutators (Idempotent Cypher) ──────────────────────────────

    async def _apply_event_to_graph(self, event: OutboxEvent) -> None:
        """
        Execute idempotent Cypher statements matching the specific domain event.
        Guarantees that re-running the same event produces identical graph topology.
        """
        payload = event.payload
        event_type = event.event_type
        agg_id = str(event.aggregate_id)

        if event_type in (OutboxEventType.STUDENT_REGISTERED.value, OutboxEventType.STUDENT_UPDATED.value):
            cypher = """
            MERGE (s:Student {uuid: $uuid})
            ON CREATE SET s.id = $uuid,
                          s.email = $email,
                          s.name = $name,
                          s.level = coalesce($level, 1),
                          s.xpPoints = coalesce($xp_points, 0),
                          s.masteryScore = coalesce($mastery_score, 0.0),
                          s.createdAt = datetime(),
                          s.updatedAt = datetime(),
                          s.status = "active"
            ON MATCH SET s.email = coalesce($email, s.email),
                         s.name = coalesce($name, s.name),
                         s.level = coalesce($level, s.level),
                         s.xpPoints = coalesce($xp_points, s.xpPoints),
                         s.masteryScore = coalesce($mastery_score, s.masteryScore),
                         s.updatedAt = datetime()
            """
            params = {
                "uuid": agg_id,
                "email": payload.get("email"),
                "name": payload.get("name"),
                "level": payload.get("level", 1),
                "xp_points": payload.get("xp_points", 0),
                "mastery_score": payload.get("mastery_score", 0.0),
            }
            await self.graph.execute_write(cypher, params)

        elif event_type == OutboxEventType.STUDENT_ENROLLED.value:
            cypher = """
            MATCH (s:Student {uuid: $student_id})
            MATCH (c:Course {uuid: $course_id})
            MERGE (s)-[r:STUDENT_ENROLLED_IN]->(c)
            SET r.enrolledAt = datetime(),
                r.status = "active",
                r.updatedAt = datetime()
            """
            params = {
                "student_id": agg_id,
                "course_id": str(payload.get("course_id")),
            }
            await self.graph.execute_write(cypher, params)

        elif event_type in (OutboxEventType.COURSE_CREATED.value, OutboxEventType.COURSE_UPDATED.value):
            cypher = """
            MERGE (c:Course {uuid: $uuid})
            SET c.id = $uuid,
                c.name = $title,
                c.slug = $slug,
                c.difficulty = $difficulty,
                c.category = $category,
                c.updatedAt = datetime()
            """
            params = {
                "uuid": agg_id,
                "title": payload.get("title", "Course"),
                "slug": payload.get("slug", agg_id),
                "difficulty": payload.get("difficulty", "BEGINNER"),
                "category": payload.get("category", "General"),
            }
            await self.graph.execute_write(cypher, params)

        elif event_type in (OutboxEventType.TOPIC_CREATED.value, OutboxEventType.TOPIC_UPDATED.value):
            cypher = """
            MERGE (t:Topic {uuid: $uuid})
            SET t.id = $uuid,
                t.name = $title,
                t.difficulty = $difficulty,
                t.updatedAt = datetime()
            WITH t
            WHERE $subject_id IS NOT NULL
            MATCH (s:Subject {uuid: $subject_id})
            MERGE (s)-[:HAS_TOPIC]->(t)
            """
            params = {
                "uuid": agg_id,
                "title": payload.get("title", "Topic"),
                "difficulty": payload.get("difficulty", "INTERMEDIATE"),
                "subject_id": payload.get("subject_id"),
            }
            await self.graph.execute_write(cypher, params)

        elif event_type in (OutboxEventType.CONCEPT_CREATED.value, OutboxEventType.CONCEPT_UPDATED.value):
            cypher = """
            MERGE (co:Concept {uuid: $uuid})
            SET co.id = $uuid,
                co.name = $name,
                co.description = $description,
                co.updatedAt = datetime()
            WITH co
            WHERE $topic_id IS NOT NULL
            MATCH (t:Topic {uuid: $topic_id})
            MERGE (t)-[:HAS_CONCEPT]->(co)
            """
            params = {
                "uuid": agg_id,
                "name": payload.get("name", "Concept"),
                "description": payload.get("description", ""),
                "topic_id": payload.get("topic_id"),
            }
            await self.graph.execute_write(cypher, params)

        elif event_type == OutboxEventType.PREREQUISITE_LINKED.value:
            cypher = """
            MATCH (src:Concept {uuid: $source_id})
            MATCH (tgt:Concept {uuid: $target_id})
            MERGE (src)-[r:PREREQUISITE]->(tgt)
            SET r.strength = coalesce($strength, 1.0),
                r.confidence = 0.95,
                r.updatedAt = datetime()
            """
            params = {
                "source_id": str(payload.get("source_id")),
                "target_id": str(payload.get("target_id")),
                "strength": payload.get("strength", 1.0),
            }
            await self.graph.execute_write(cypher, params)

        elif event_type == OutboxEventType.CONCEPT_MASTERY_UPDATED.value:
            # Atomic transition between MASTERED and WEAK_AT based on score
            score = float(payload.get("score", 0.0))
            is_mastered = score >= 0.70

            if is_mastered:
                cypher = """
                MATCH (s:Student {uuid: $student_id})
                MATCH (c:Concept {uuid: $concept_id})
                OPTIONAL MATCH (s)-[w:WEAK_AT]->(c)
                DELETE w
                OPTIONAL MATCH (s)-[l:LEARNING]->(c)
                DELETE l
                MERGE (s)-[m:MASTERED]->(c)
                SET m.score = $score,
                    m.confidence = 0.95,
                    m.masteredAt = datetime(),
                    m.updatedAt = datetime()
                """
            else:
                cypher = """
                MATCH (s:Student {uuid: $student_id})
                MATCH (c:Concept {uuid: $concept_id})
                OPTIONAL MATCH (s)-[m:MASTERED]->(c)
                DELETE m
                MERGE (s)-[w:WEAK_AT]->(c)
                SET w.score = $score,
                    w.failureCount = coalesce(w.failureCount, 0) + 1,
                    w.confidence = 0.90,
                    w.lastFailedAt = datetime(),
                    w.updatedAt = datetime()
                """
            params = {
                "student_id": agg_id,
                "concept_id": str(payload.get("concept_id")),
                "score": score,
            }
            await self.graph.execute_write(cypher, params)

        elif event_type == OutboxEventType.WEAK_CONCEPT_DETECTED.value:
            cypher = """
            MATCH (s:Student {uuid: $student_id})
            MATCH (c:Concept {uuid: $concept_id})
            OPTIONAL MATCH (s)-[m:MASTERED]->(c)
            DELETE m
            MERGE (s)-[w:WEAK_AT]->(c)
            SET w.failureCount = coalesce(w.failureCount, 0) + 1,
                w.severity = coalesce($severity, 1),
                w.lastFailedAt = datetime(),
                w.updatedAt = datetime()
            """
            params = {
                "student_id": agg_id,
                "concept_id": str(payload.get("concept_id")),
                "severity": payload.get("severity", 1),
            }
            await self.graph.execute_write(cypher, params)

        else:
            logger.info("sync.unhandled_event_type_skipped", event_type=event_type)

    # ── Redis Cache Invalidation ──────────────────────────────────────────────

    async def _invalidate_cache(self, event: OutboxEvent) -> None:
        """Purge specific Redis cache keys affected by the synchronized entity."""
        try:
            agg_type = event.aggregate_type
            agg_id = str(event.aggregate_id)

            keys_to_delete = []
            if agg_type == "STUDENT":
                keys_to_delete.extend([
                    f"cache:student:mastery:{agg_id}",
                    f"cache:student:path:{agg_id}",
                    f"cache:student:stats:{agg_id}",
                    f"cache:recommendations:{agg_id}",
                ])
            elif agg_type == "COURSE":
                keys_to_delete.extend([
                    f"cache:graph:topology:{agg_id}",
                    f"cache:course:details:{agg_id}",
                ])
            elif agg_type in ("TOPIC", "CONCEPT"):
                # Concept changes invalidate general graph cache
                keys_to_delete.append("cache:graph:global_topology")

            if keys_to_delete:
                for k in keys_to_delete:
                    try:
                        await self.redis.delete(k)
                    except Exception:
                        pass
        except Exception as exc:
            logger.warning("sync.cache_invalidation_non_critical_error", error=str(exc))

    # ── Consistency Reconciliation (Anti-Entropy Audit) ───────────────────────

    async def reconcile_student(self, student_id: UUID) -> Dict[str, Any]:
        """
        Anti-entropy drift detector & repair for a student.
        Compares PostgreSQL canonical masteries against Neo4j relationships.
        """
        # 1. Fetch PostgreSQL truth
        mastery_query = (
            select(ConceptMastery)
            .where(ConceptMastery.student_id == student_id)
        )
        pg_res = await self.session.execute(mastery_query)
        pg_masteries = pg_res.scalars().all()

        # 2. Fetch Neo4j current state
        cypher = """
        MATCH (s:Student {uuid: $student_id})-[r:MASTERED|WEAK_AT]->(c:Concept)
        RETURN c.uuid AS concept_id, type(r) AS rel_type, r.score AS score
        """
        neo4j_records = await self.graph.execute_read(cypher, {"student_id": str(student_id)})
        neo4j_map = {rec["concept_id"]: {"type": rec["rel_type"], "score": rec["score"]} for rec in neo4j_records}

        repaired_count = 0
        discrepancies: List[Dict[str, Any]] = []

        # 3. Detect and repair drift
        for pm in pg_masteries:
            cid = str(pm.concept_id)
            score = float(pm.mastery_score)
            expected_type = "MASTERED" if score >= 0.70 else "WEAK_AT"

            current = neo4j_map.get(cid)
            if not current or current["type"] != expected_type:
                discrepancies.append({
                    "concept_id": cid,
                    "expected": expected_type,
                    "actual": current["type"] if current else "NONE",
                })
                # Repair Neo4j state
                if expected_type == "MASTERED":
                    repair_cypher = """
                    MATCH (s:Student {uuid: $student_id})
                    MERGE (c:Concept {uuid: $concept_id})
                    OPTIONAL MATCH (s)-[w:WEAK_AT]->(c)
                    DELETE w
                    MERGE (s)-[m:MASTERED]->(c)
                    SET m.score = $score, m.updatedAt = datetime()
                    """
                else:
                    repair_cypher = """
                    MATCH (s:Student {uuid: $student_id})
                    MERGE (c:Concept {uuid: $concept_id})
                    OPTIONAL MATCH (s)-[m:MASTERED]->(c)
                    DELETE m
                    MERGE (s)-[w:WEAK_AT]->(c)
                    SET w.score = $score, w.updatedAt = datetime()
                    """
                await self.graph.execute_write(repair_cypher, {
                    "student_id": str(student_id),
                    "concept_id": cid,
                    "score": score,
                })
                repaired_count += 1

        # Purge student caches after reconciliation
        await self.redis.delete(
            f"cache:student:mastery:{student_id}",
            f"cache:student:path:{student_id}",
        )

        return {
            "student_id": str(student_id),
            "discrepancies_found": len(discrepancies),
            "repaired_count": repaired_count,
            "details": discrepancies,
            "status": "reconciled",
        }

    async def get_health(self) -> Dict[str, Any]:
        """Aggregate health across PostgreSQL Outbox, Neo4j, and Redis."""
        outbox_metrics = await self.outbox_repo.get_metrics()
        neo4j_healthy = False
        redis_healthy = False

        try:
            res = await self.graph.execute_read("RETURN 1 AS ping")
            neo4j_healthy = len(res) > 0 and res[0].get("ping") == 1
        except Exception:
            neo4j_healthy = False

        try:
            pong = await self.redis.get_client().ping()
            redis_healthy = bool(pong)
        except Exception:
            redis_healthy = False

        return {
            "outbox": outbox_metrics,
            "neo4j_connected": neo4j_healthy,
            "redis_connected": redis_healthy,
            "system_status": "healthy" if (neo4j_healthy and redis_healthy and outbox_metrics["dead_letter_count"] == 0) else "degraded",
        }
