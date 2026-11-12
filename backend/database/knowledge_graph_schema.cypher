// ============================================================================
// LearnGraph — Neo4j Knowledge Graph Production Schema
// Adaptive Knowledge Graph for Continuous Education
// Compatible with Neo4j 5.x & Graph Data Science (GDS) 2.x
// ============================================================================

// ----------------------------------------------------------------------------
// 1. UNIQUENESS CONSTRAINTS (Guarantees Global UUID & Primary Key Integrity)
// ----------------------------------------------------------------------------

CREATE CONSTRAINT student_uuid_unique IF NOT EXISTS
FOR (s:Student) REQUIRE s.uuid IS UNIQUE;

CREATE CONSTRAINT teacher_uuid_unique IF NOT EXISTS
FOR (t:Teacher) REQUIRE t.uuid IS UNIQUE;

CREATE CONSTRAINT course_uuid_unique IF NOT EXISTS
FOR (c:Course) REQUIRE c.uuid IS UNIQUE;

CREATE CONSTRAINT subject_uuid_unique IF NOT EXISTS
FOR (s:Subject) REQUIRE s.uuid IS UNIQUE;

CREATE CONSTRAINT topic_uuid_unique IF NOT EXISTS
FOR (t:Topic) REQUIRE t.uuid IS UNIQUE;

CREATE CONSTRAINT lesson_uuid_unique IF NOT EXISTS
FOR (l:Lesson) REQUIRE l.uuid IS UNIQUE;

CREATE CONSTRAINT concept_uuid_unique IF NOT EXISTS
FOR (c:Concept) REQUIRE c.uuid IS UNIQUE;

CREATE CONSTRAINT concept_name_unique IF NOT EXISTS
FOR (c:Concept) REQUIRE c.name IS UNIQUE;

CREATE CONSTRAINT skill_uuid_unique IF NOT EXISTS
FOR (s:Skill) REQUIRE s.uuid IS UNIQUE;

CREATE CONSTRAINT quiz_uuid_unique IF NOT EXISTS
FOR (q:Quiz) REQUIRE q.uuid IS UNIQUE;

CREATE CONSTRAINT question_uuid_unique IF NOT EXISTS
FOR (q:Question) REQUIRE q.uuid IS UNIQUE;

CREATE CONSTRAINT resource_uuid_unique IF NOT EXISTS
FOR (r:Resource) REQUIRE r.uuid IS UNIQUE;

CREATE CONSTRAINT video_uuid_unique IF NOT EXISTS
FOR (v:Video) REQUIRE v.uuid IS UNIQUE;

CREATE CONSTRAINT book_uuid_unique IF NOT EXISTS
FOR (b:Book) REQUIRE b.uuid IS UNIQUE;

CREATE CONSTRAINT article_uuid_unique IF NOT EXISTS
FOR (a:Article) REQUIRE a.uuid IS UNIQUE;

CREATE CONSTRAINT assignment_uuid_unique IF NOT EXISTS
FOR (a:Assignment) REQUIRE a.uuid IS UNIQUE;

CREATE CONSTRAINT learning_path_uuid_unique IF NOT EXISTS
FOR (lp:LearningPath) REQUIRE lp.uuid IS UNIQUE;

CREATE CONSTRAINT recommendation_uuid_unique IF NOT EXISTS
FOR (r:Recommendation) REQUIRE r.uuid IS UNIQUE;

CREATE CONSTRAINT study_goal_uuid_unique IF NOT EXISTS
FOR (sg:StudyGoal) REQUIRE sg.uuid IS UNIQUE;

CREATE CONSTRAINT weak_concept_uuid_unique IF NOT EXISTS
FOR (wc:WeakConcept) REQUIRE wc.uuid IS UNIQUE;

// ----------------------------------------------------------------------------
// 2. B-TREE LOOKUP INDEXES (Optimized for filtering, ordering and joins)
// ----------------------------------------------------------------------------

CREATE INDEX student_email_idx IF NOT EXISTS
FOR (s:Student) ON (s.email);

CREATE INDEX teacher_email_idx IF NOT EXISTS
FOR (t:Teacher) ON (t.email);

CREATE INDEX course_slug_idx IF NOT EXISTS
FOR (c:Course) ON (c.slug);

CREATE INDEX topic_difficulty_idx IF NOT EXISTS
FOR (t:Topic) ON (t.difficulty);

CREATE INDEX concept_subject_area_idx IF NOT EXISTS
FOR (c:Concept) ON (c.subjectArea);

CREATE INDEX concept_difficulty_idx IF NOT EXISTS
FOR (c:Concept) ON (c.difficulty);

CREATE INDEX lesson_order_idx IF NOT EXISTS
FOR (l:Lesson) ON (l.orderIndex);

CREATE INDEX quiz_type_idx IF NOT EXISTS
FOR (q:Quiz) ON (q.quizType);

CREATE INDEX resource_type_idx IF NOT EXISTS
FOR (r:Resource) ON (r.resourceType);

CREATE INDEX weak_concept_resolved_idx IF NOT EXISTS
FOR (wc:WeakConcept) ON (wc.isResolved);

// ----------------------------------------------------------------------------
// 3. FULL-TEXT SEARCH INDEXES (For natural language exploration and search)
// ----------------------------------------------------------------------------

CREATE FULLTEXT INDEX concept_search_idx IF NOT EXISTS
FOR (c:Concept) ON EACH [c.name, c.description];

CREATE FULLTEXT INDEX curriculum_search_idx IF NOT EXISTS
FOR (n:Course|Subject|Topic|Lesson) ON EACH [n.name, n.description];

// ----------------------------------------------------------------------------
// 4. RELATIONSHIP PROPERTY INDEXES (Point evaluation on edge traversal)
// ----------------------------------------------------------------------------

CREATE INDEX rel_prerequisite_strength_idx IF NOT EXISTS
FOR ()-[r:PREREQUISITE]-() ON (r.strength, r.weight);

CREATE INDEX rel_mastered_score_idx IF NOT EXISTS
FOR ()-[r:MASTERED]-() ON (r.score, r.updatedAt);

CREATE INDEX rel_weak_count_idx IF NOT EXISTS
FOR ()-[r:WEAK_AT]-() ON (r.failureCount);
