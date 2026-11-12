"""
LearnGraph — Neo4j Graph Schema
Cypher statements establishing uniqueness constraints and indexes across all 19 Node types.
Run once at application startup via initialize_schema().
"""

import structlog
from neo4j import AsyncSession

from app.core.exceptions import GraphError

logger = structlog.get_logger(__name__)

# ── Constraint & Index Definitions across all 19 Nodes ────────────────────────

GRAPH_SCHEMA: list[str] = [
    # ── 1. Uniqueness Constraints on UUID ──────────────────────────────────────
    "CREATE CONSTRAINT student_uuid_unique IF NOT EXISTS FOR (s:Student) REQUIRE s.uuid IS UNIQUE",
    "CREATE CONSTRAINT teacher_uuid_unique IF NOT EXISTS FOR (t:Teacher) REQUIRE t.uuid IS UNIQUE",
    "CREATE CONSTRAINT course_uuid_unique IF NOT EXISTS FOR (c:Course) REQUIRE c.uuid IS UNIQUE",
    "CREATE CONSTRAINT subject_uuid_unique IF NOT EXISTS FOR (s:Subject) REQUIRE s.uuid IS UNIQUE",
    "CREATE CONSTRAINT topic_uuid_unique IF NOT EXISTS FOR (t:Topic) REQUIRE t.uuid IS UNIQUE",
    "CREATE CONSTRAINT lesson_uuid_unique IF NOT EXISTS FOR (l:Lesson) REQUIRE l.uuid IS UNIQUE",
    "CREATE CONSTRAINT concept_uuid_unique IF NOT EXISTS FOR (c:Concept) REQUIRE c.uuid IS UNIQUE",
    "CREATE CONSTRAINT concept_name_unique IF NOT EXISTS FOR (c:Concept) REQUIRE c.name IS UNIQUE",
    "CREATE CONSTRAINT skill_uuid_unique IF NOT EXISTS FOR (s:Skill) REQUIRE s.uuid IS UNIQUE",
    "CREATE CONSTRAINT quiz_uuid_unique IF NOT EXISTS FOR (q:Quiz) REQUIRE q.uuid IS UNIQUE",
    "CREATE CONSTRAINT question_uuid_unique IF NOT EXISTS FOR (q:Question) REQUIRE q.uuid IS UNIQUE",
    "CREATE CONSTRAINT resource_uuid_unique IF NOT EXISTS FOR (r:Resource) REQUIRE r.uuid IS UNIQUE",
    "CREATE CONSTRAINT video_uuid_unique IF NOT EXISTS FOR (v:Video) REQUIRE v.uuid IS UNIQUE",
    "CREATE CONSTRAINT book_uuid_unique IF NOT EXISTS FOR (b:Book) REQUIRE b.uuid IS UNIQUE",
    "CREATE CONSTRAINT article_uuid_unique IF NOT EXISTS FOR (a:Article) REQUIRE a.uuid IS UNIQUE",
    "CREATE CONSTRAINT assignment_uuid_unique IF NOT EXISTS FOR (a:Assignment) REQUIRE a.uuid IS UNIQUE",
    "CREATE CONSTRAINT learning_path_uuid_unique IF NOT EXISTS FOR (lp:LearningPath) REQUIRE lp.uuid IS UNIQUE",
    "CREATE CONSTRAINT recommendation_uuid_unique IF NOT EXISTS FOR (r:Recommendation) REQUIRE r.uuid IS UNIQUE",
    "CREATE CONSTRAINT study_goal_uuid_unique IF NOT EXISTS FOR (sg:StudyGoal) REQUIRE sg.uuid IS UNIQUE",
    "CREATE CONSTRAINT weak_concept_uuid_unique IF NOT EXISTS FOR (wc:WeakConcept) REQUIRE wc.uuid IS UNIQUE",

    # ── Backward compatibility constraints on .id ───────────────────────────
    "CREATE CONSTRAINT student_id IF NOT EXISTS FOR (s:Student) REQUIRE s.id IS UNIQUE",
    "CREATE CONSTRAINT course_id IF NOT EXISTS FOR (c:Course) REQUIRE c.id IS UNIQUE",
    "CREATE CONSTRAINT topic_id IF NOT EXISTS FOR (t:Topic) REQUIRE t.id IS UNIQUE",
    "CREATE CONSTRAINT quiz_id IF NOT EXISTS FOR (q:Quiz) REQUIRE q.id IS UNIQUE",

    # ── 2. Performance Lookup Indexes ─────────────────────────────────────────
    "CREATE INDEX student_email IF NOT EXISTS FOR (s:Student) ON (s.email)",
    "CREATE INDEX teacher_email IF NOT EXISTS FOR (t:Teacher) ON (t.email)",
    "CREATE INDEX topic_difficulty IF NOT EXISTS FOR (t:Topic) ON (t.difficulty)",
    "CREATE INDEX course_slug IF NOT EXISTS FOR (c:Course) ON (c.slug)",
    "CREATE INDEX concept_subject_area IF NOT EXISTS FOR (c:Concept) ON (c.subjectArea)",
    "CREATE INDEX concept_difficulty IF NOT EXISTS FOR (c:Concept) ON (c.difficulty)",

    # ── 3. Full-Text Natural Language Search Index ────────────────────────────
    "CREATE FULLTEXT INDEX concept_search_idx IF NOT EXISTS FOR (c:Concept) ON EACH [c.name, c.description]",
]


async def initialize_schema(session: AsyncSession) -> None:
    """Execute all schema DDL statements against the Neo4j session."""
    logger.info("graph_schema.initialize_schema.start", count=len(GRAPH_SCHEMA))
    failed: list[tuple[str, Exception]] = []

    for cypher in GRAPH_SCHEMA:
        try:
            await session.run(cypher)
        except Exception as exc:
            logger.warning("graph_schema.statement_warning", cypher=cypher[:60], error=str(exc))
            failed.append((cypher, exc))

    logger.info("graph_schema.initialize_schema.done", successful=len(GRAPH_SCHEMA) - len(failed))
