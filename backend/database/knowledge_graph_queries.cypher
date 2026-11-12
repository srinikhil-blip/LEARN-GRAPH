// ============================================================================
// LearnGraph — Production Cypher Queries for Adaptive Knowledge Graphs
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Find Prerequisite Concepts for a Target Concept (Direct & Multi-hop)
// ----------------------------------------------------------------------------
// Target: Retrieve all direct and recursive prerequisites for a given concept,
// including dependency strength and current student completion state.
MATCH path = (p:Concept)-[:PREREQUISITE*1..3]->(target:Concept {uuid: $concept_uuid})
OPTIONAL MATCH (s:Student {uuid: $student_uuid})-[m:MASTERED]->(p)
RETURN p.uuid AS prerequisite_id,
       p.name AS prerequisite_name,
       p.difficulty AS difficulty,
       length(path) AS distance,
       CASE WHEN m IS NOT NULL THEN true ELSE false END AS is_mastered,
       coalesce(m.score, 0.0) AS mastery_score
ORDER BY distance DESC, p.difficulty ASC;

// ----------------------------------------------------------------------------
// 2. Find Weak Concepts for a Given Student
// ----------------------------------------------------------------------------
// Target: Extract all concepts where the student has demonstrated weakness,
// prioritized by failure count, low mastery score, and recency.
MATCH (s:Student {uuid: $student_uuid})-[w:WEAK_AT]->(c:Concept)
OPTIONAL MATCH (c)<-[:HAS_CONCEPT]-(t:Topic)
RETURN c.uuid AS concept_id,
       c.name AS concept_name,
       c.subjectArea AS subject_area,
       w.failureCount AS failure_count,
       w.confidence AS weakness_confidence,
       w.updatedAt AS last_tested,
       collect(DISTINCT t.name) AS associated_topics
ORDER BY w.failureCount DESC, w.updatedAt DESC;

// ----------------------------------------------------------------------------
// 3. Generate Personalized Learning Path
// ----------------------------------------------------------------------------
// Target: Given a target concept, compute an ordered progression of unlearned
// prerequisites, factoring in student's current mastery and difficulty tiers.
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

// ----------------------------------------------------------------------------
// 4. Recommend Next Lesson
// ----------------------------------------------------------------------------
// Target: Find the next unlocked lesson in an enrolled course where all
// prerequisite concepts for the lesson's parent topic are mastered.
MATCH (s:Student {uuid: $student_uuid})-[:STUDENT_ENROLLED_IN]->(c:Course {uuid: $course_uuid})
MATCH (c)-[:HAS_SUBJECT]->(:Subject)-[:HAS_TOPIC]->(t:Topic)-[:HAS_LESSON]->(l:Lesson)
WHERE NOT (s)-[:MASTERED]->(l) AND NOT (s)-[:LEARNING]->(l)
// Check that all prerequisite concepts of this topic are mastered
OPTIONAL MATCH (t)-[:HAS_CONCEPT]->(con:Concept)<-[:PREREQUISITE]-(req:Concept)
WITH s, t, l, count(req) AS total_prereqs,
     count { MATCH (s)-[:MASTERED]->(req) } AS mastered_prereqs
WHERE total_prereqs = mastered_prereqs
RETURN l.uuid AS lesson_id,
       l.name AS lesson_title,
       t.name AS topic_name,
       l.durationSeconds AS duration,
       l.orderIndex AS sequence_index
ORDER BY t.orderIndex ASC, l.orderIndex ASC
LIMIT 1;

// ----------------------------------------------------------------------------
// 5. Recommend Next Quiz (Adaptive Diagnostic based on Weak Areas)
// ----------------------------------------------------------------------------
// Target: Recommend quizzes that directly test currently unmastered or weak concepts.
MATCH (s:Student {uuid: $student_uuid})-[w:WEAK_AT]->(c:Concept)
MATCH (q:Quiz)-[:TESTS]->(c)
WHERE NOT (s)-[:ATTEMPTED]->(q)
RETURN q.uuid AS quiz_id,
       q.name AS quiz_title,
       q.quizType AS type,
       c.name AS target_weak_concept,
       w.failureCount AS urgency_weight
ORDER BY urgency_weight DESC
LIMIT 3;

// ----------------------------------------------------------------------------
// 6. Find Similar Concepts (Cross-Subject Relationships)
// ----------------------------------------------------------------------------
// Target: Discover semantically equivalent or overlapping concepts in other disciplines.
MATCH (c:Concept {uuid: $concept_uuid})-[r:SIMILAR_TO|RELATED_TO]-(other:Concept)
RETURN other.uuid AS similar_concept_id,
       other.name AS concept_name,
       other.subjectArea AS subject_area,
       type(r) AS relationship_type,
       r.strength AS relationship_strength,
       r.confidence AS confidence
ORDER BY r.strength DESC;

// ----------------------------------------------------------------------------
// 7. Find Shortest Learning Path (Between Two Disparate Concepts)
// ----------------------------------------------------------------------------
// Target: Determine minimal prerequisite bridge from source to advanced target.
MATCH (source:Concept {uuid: $source_uuid}), (target:Concept {uuid: $target_uuid})
MATCH p = shortestPath((source)-[:PREREQUISITE|DEPENDS_ON*..8]->(target))
RETURN [n IN nodes(p) | {uuid: n.uuid, name: n.name, difficulty: n.difficulty}] AS path_nodes,
       length(p) AS hops;

// ----------------------------------------------------------------------------
// 8. Detect Disconnected Concepts (Graph Integrity & Orphan Detection)
// ----------------------------------------------------------------------------
// Target: Audit graph to detect isolated concepts lacking prerequisites or topic links.
MATCH (c:Concept)
WHERE NOT (c)--()
RETURN c.uuid AS orphaned_concept_id,
       c.name AS concept_name,
       c.subjectArea AS subject_area,
       c.createdAt AS created_at;

// ----------------------------------------------------------------------------
// 9. Find Learning Bottlenecks (High In-Degree Prerequisite Nodes)
// ----------------------------------------------------------------------------
// Target: Detect pivotal foundational concepts that block the most downstream concepts.
MATCH (bottleneck:Concept)<-[r:PREREQUISITE]-(downstream:Concept)
WITH bottleneck, count(downstream) AS blocked_concepts_count
WHERE blocked_concepts_count >= 3
RETURN bottleneck.uuid AS concept_id,
       bottleneck.name AS bottleneck_concept,
       bottleneck.subjectArea AS subject_area,
       blocked_concepts_count
ORDER BY blocked_concepts_count DESC;

// ----------------------------------------------------------------------------
// 10. Get Full Concept Mastery for a Student
// ----------------------------------------------------------------------------
// Target: Retrieve distribution of mastered, learning, and weak concepts.
MATCH (s:Student {uuid: $student_uuid})
OPTIONAL MATCH (s)-[m:MASTERED]->(mc:Concept)
OPTIONAL MATCH (s)-[l:LEARNING]->(lc:Concept)
OPTIONAL MATCH (s)-[w:WEAK_AT]->(wc:Concept)
RETURN s.uuid AS student_id,
       count(DISTINCT mc) AS mastered_count,
       count(DISTINCT lc) AS learning_count,
       count(DISTINCT wc) AS weak_count,
       round(avg(m.score), 2) AS average_mastery_score;

// ----------------------------------------------------------------------------
// 11. Find All Dependencies (Transitive Closure with APOC)
// ----------------------------------------------------------------------------
// Target: Extract entire upstream dependency tree for curriculum audit.
MATCH (root:Concept {uuid: $concept_uuid})
CALL apoc.path.subgraphNodes(root, {
    relationshipFilter: "PREREQUISITE>|DEPENDS_ON>",
    maxLevel: 5
}) YIELD node
RETURN node.uuid AS dependency_uuid,
       node.name AS dependency_name,
       node.difficulty AS difficulty;

// ----------------------------------------------------------------------------
// 12. Update Mastery (Atomic State Machine Transition)
// ----------------------------------------------------------------------------
// Target: Transition concept from LEARNING/WEAK to MASTERED with score update.
MATCH (s:Student {uuid: $student_uuid})
MATCH (c:Concept {uuid: $concept_uuid})
OPTIONAL MATCH (s)-[w:WEAK_AT]->(c)
DELETE w
OPTIONAL MATCH (s)-[l:LEARNING]->(c)
DELETE l
MERGE (s)-[m:MASTERED]->(c)
SET m.score = $score,
    m.confidence = $confidence,
    m.updatedAt = datetime(),
    c.updatedAt = datetime()
RETURN s.uuid AS student_id, c.name AS concept_name, m.score AS current_score;

// ----------------------------------------------------------------------------
// 13. Update Graph After Quiz Submission
// ----------------------------------------------------------------------------
// Target: Process quiz results atomically across tested concepts.
// $passed: Boolean, $tested_concept_uuids: List[String], $score: Float
MATCH (s:Student {uuid: $student_uuid})
MATCH (q:Quiz {uuid: $quiz_uuid})
MERGE (s)-[a:ATTEMPTED]->(q)
SET a.score = $score,
    a.passed = $passed,
    a.attemptedAt = datetime()
WITH s, q
UNWIND $tested_concept_uuids AS c_uuid
MATCH (c:Concept {uuid: c_uuid})
FOREACH (_ IN CASE WHEN $passed THEN [1] ELSE [] END |
    MERGE (s)-[m:MASTERED]->(c)
    SET m.score = $score, m.updatedAt = datetime()
)
FOREACH (_ IN CASE WHEN NOT $passed THEN [1] ELSE [] END |
    MERGE (s)-[w:WEAK_AT]->(c)
    SET w.failureCount = coalesce(w.failureCount, 0) + 1,
        w.confidence = 0.90,
        w.updatedAt = datetime()
);

// ----------------------------------------------------------------------------
// 14. Generate Concept Neighborhood (Optimized for React Flow Visualization)
// ----------------------------------------------------------------------------
// Returns nodes and edges formatted with exact UI color specifications:
// Green = Mastered, Yellow = Learning, Red = Weak, Blue = Recommended, Purple = AI Generated
MATCH (center:Concept {uuid: $concept_uuid})
OPTIONAL MATCH path = (center)-[r:PREREQUISITE|RELATED_TO|SIMILAR_TO]-(neighbor:Concept)
OPTIONAL MATCH (s:Student {uuid: $student_uuid})-[m:MASTERED]->(neighbor)
OPTIONAL MATCH (s)-[w:WEAK_AT]->(neighbor)
OPTIONAL MATCH (s)-[l:LEARNING]->(neighbor)
WITH center, neighbor, r,
     CASE
       WHEN neighbor.isAIGenerated = true THEN '#8b5cf6'  // Purple: AI Generated
       WHEN m IS NOT NULL THEN '#10b981'                 // Green: Mastered
       WHEN w IS NOT NULL THEN '#ef4444'                 // Red: Weak
       WHEN l IS NOT NULL THEN '#f59e0b'                 // Yellow: Learning
       ELSE '#3b82f6'                                     // Blue: Recommended
     END AS node_color,
     CASE
       WHEN neighbor.isAIGenerated = true THEN 'ai_generated'
       WHEN m IS NOT NULL THEN 'mastered'
       WHEN w IS NOT NULL THEN 'weak'
       WHEN l IS NOT NULL THEN 'learning'
       ELSE 'recommended'
     END AS node_status
RETURN {
    id: center.uuid,
    name: center.name,
    difficulty: center.difficulty,
    color: '#10b981',
    status: 'center'
} AS center_node,
collect(DISTINCT {
    id: neighbor.uuid,
    name: neighbor.name,
    difficulty: neighbor.difficulty,
    color: node_color,
    status: node_status
}) AS neighbor_nodes,
collect(DISTINCT {
    id: id(r),
    source: startNode(r).uuid,
    target: endNode(r).uuid,
    type: type(r),
    strength: r.strength
}) AS edges;
