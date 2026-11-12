-- ============================================================================
-- LearnGraph — Production PostgreSQL Database Schema (3NF)
-- Adaptive Knowledge Graph for Continuous Education
-- Designed for High Scalability, Partitioning, pgvector, and Neo4j Synchronization
-- ============================================================================

-- ── 1. PostgreSQL Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ── 2. Custom Enumeration Types ─────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('student', 'teacher', 'admin', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE course_difficulty_type AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE course_status_type AS ENUM ('draft', 'published', 'archived', 'deprecated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE content_format_type AS ENUM ('text', 'video', 'pdf', 'interactive', 'audio');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE quiz_category_type AS ENUM ('practice', 'assessment', 'diagnostic', 'adaptive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE question_format_type AS ENUM ('mcq', 'true_false', 'short_answer', 'fill_blank');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE question_difficulty_type AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE learning_progress_type AS ENUM ('not_started', 'in_progress', 'completed', 'mastered');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE resource_category_type AS ENUM ('topic', 'course', 'video', 'book', 'problem', 'article');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE notification_tone_type AS ENUM ('info', 'success', 'warning', 'achievement', 'reminder', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE file_format_type AS ENUM ('pdf', 'docx', 'pptx', 'txt', 'image');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ocr_processing_type AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE goal_period_type AS ENUM ('daily', 'weekly', 'monthly', 'course_completion', 'topic_mastery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE learning_style_type AS ENUM ('visual', 'auditory', 'reading', 'kinesthetic');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 3. Helper Functions ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ── MODULE 1: AUTHENTICATION & RBAC ─────────────────────────────────────────
-- ============================================================================

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) NOT NULL UNIQUE,
    hashed_password VARCHAR(1024) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url VARCHAR(2048),
    bio TEXT,
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    locale VARCHAR(16) NOT NULL DEFAULT 'en',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Table: roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(128) NOT NULL UNIQUE,
    resource VARCHAR(64) NOT NULL,
    action VARCHAR(32) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: user_roles (Many-to-Many User <-> Role)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Table: role_permissions (Many-to-Many Role <-> Permission)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Table: sessions (User Browser/Client Sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at) WHERE is_revoked IS FALSE;

-- Table: refresh_tokens (JWT Refresh Token Management with Blacklisting)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    jti VARCHAR(64) NOT NULL UNIQUE,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_jti ON refresh_tokens(jti) WHERE is_revoked IS FALSE;

-- ============================================================================
-- ── MODULE 2: PROFILES ──────────────────────────────────────────────────────
-- ============================================================================

-- Table: student_profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    university VARCHAR(255),
    degree VARCHAR(255),
    year_of_study SMALLINT CHECK (year_of_study BETWEEN 1 AND 12),
    level INT NOT NULL DEFAULT 1 CHECK (level >= 1),
    xp_points BIGINT NOT NULL DEFAULT 0 CHECK (xp_points >= 0),
    streak_days INT NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
    longest_streak_days INT NOT NULL DEFAULT 0 CHECK (longest_streak_days >= 0),
    total_study_hours NUMERIC(8, 2) NOT NULL DEFAULT 0.00 CHECK (total_study_hours >= 0),
    mastery_score NUMERIC(5, 4) NOT NULL DEFAULT 0.0000 CHECK (mastery_score BETWEEN 0.0000 AND 1.0000),
    preferred_difficulty course_difficulty_type NOT NULL DEFAULT 'intermediate',
    learning_style learning_style_type NOT NULL DEFAULT 'visual',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_level ON student_profiles(level);
CREATE INDEX IF NOT EXISTS idx_student_profiles_xp ON student_profiles(xp_points DESC);

-- Table: teacher_profiles
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(255),
    institution VARCHAR(255),
    expertise_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
    years_experience SMALLINT DEFAULT 0 CHECK (years_experience >= 0),
    rating NUMERIC(3, 2) DEFAULT 5.00 CHECK (rating BETWEEN 0.00 AND 5.00),
    total_students_guided INT NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON teacher_profiles(user_id);

-- Table: admin_profiles
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    department VARCHAR(128),
    audit_level VARCHAR(32) NOT NULL DEFAULT 'standard',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ── MODULE 3: EDUCATION & CURRICULUM CATALOG ────────────────────────────────
-- ============================================================================

-- Table: courses
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    difficulty course_difficulty_type NOT NULL DEFAULT 'intermediate',
    status course_status_type NOT NULL DEFAULT 'draft',
    category VARCHAR(128) NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    thumbnail_url VARCHAR(2048),
    estimated_hours NUMERIC(6, 2) NOT NULL DEFAULT 10.00 CHECK (estimated_hours > 0),
    enrolled_count INT NOT NULL DEFAULT 0 CHECK (enrolled_count >= 0),
    completion_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (completion_rate BETWEEN 0.00 AND 100.00),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_tags ON courses USING GIN(tags);

-- Table: subjects (Units / Modules inside a Course)
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    estimated_minutes INT NOT NULL DEFAULT 60 CHECK (estimated_minutes > 0),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    UNIQUE(course_id, order_index)
);
CREATE INDEX IF NOT EXISTS idx_subjects_course_id ON subjects(course_id);

-- Table: topics (Specific instructional concepts within a Subject)
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    content_format content_format_type NOT NULL DEFAULT 'text',
    content_text TEXT,
    content_url VARCHAR(2048),
    key_concepts TEXT[] DEFAULT ARRAY[]::TEXT[],
    difficulty_score NUMERIC(4, 3) NOT NULL DEFAULT 0.500 CHECK (difficulty_score BETWEEN 0.000 AND 1.000),
    estimated_minutes INT NOT NULL DEFAULT 30 CHECK (estimated_minutes > 0),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    UNIQUE(subject_id, order_index)
);
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_key_concepts ON topics USING GIN(key_concepts);

-- Table: lessons (Granular learning modules inside a Topic)
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    video_url VARCHAR(2048),
    duration_seconds INT NOT NULL DEFAULT 300 CHECK (duration_seconds >= 0),
    order_index INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    UNIQUE(topic_id, order_index)
);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);

-- Table: concepts (Fine-grained concepts for Knowledge Graph mapping)
CREATE TABLE IF NOT EXISTS concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    subject_area VARCHAR(128) NOT NULL,
    description TEXT,
    importance_weight NUMERIC(3, 2) NOT NULL DEFAULT 1.00 CHECK (importance_weight BETWEEN 0.00 AND 5.00),
    embedding vector(1536), -- OpenAI text-embedding-3-small vector
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_concepts_name ON concepts(name);
CREATE INDEX IF NOT EXISTS idx_concepts_subject_area ON concepts(subject_area);
-- HNSW Vector Index for Cosine Similarity search over concepts
CREATE INDEX IF NOT EXISTS idx_concepts_embedding ON concepts USING hnsw (embedding vector_cosine_ops);

-- Table: resources (Supplementary Books, Papers, Problems, Videos)
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    concept_id UUID REFERENCES concepts(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    resource_type resource_category_type NOT NULL,
    url VARCHAR(2048) NOT NULL,
    author VARCHAR(255),
    estimated_duration_minutes INT,
    is_free BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_resources_topic_id ON resources(topic_id);
CREATE INDEX IF NOT EXISTS idx_resources_concept_id ON resources(concept_id);

-- ============================================================================
-- ── MODULE 4: ENROLLMENT & GRANULAR PROGRESS ────────────────────────────────
-- ============================================================================

-- Table: course_enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completion_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (completion_percentage BETWEEN 0.00 AND 100.00),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);

-- Table: lesson_progress
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status learning_progress_type NOT NULL DEFAULT 'not_started',
    time_spent_seconds INT NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON lesson_progress(student_id);

-- Table: topic_progress
CREATE TABLE IF NOT EXISTS topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    status learning_progress_type NOT NULL DEFAULT 'not_started',
    mastery_score NUMERIC(5, 4) NOT NULL DEFAULT 0.0000 CHECK (mastery_score BETWEEN 0.0000 AND 1.0000),
    time_spent_minutes INT NOT NULL DEFAULT 0 CHECK (time_spent_minutes >= 0),
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, topic_id)
);
CREATE INDEX IF NOT EXISTS idx_topic_progress_student ON topic_progress(student_id);

-- Table: concept_mastery (Node status in Adaptive Knowledge Graph)
CREATE TABLE IF NOT EXISTS concept_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    mastery_score NUMERIC(5, 4) NOT NULL DEFAULT 0.0000 CHECK (mastery_score BETWEEN 0.0000 AND 1.0000),
    status learning_progress_type NOT NULL DEFAULT 'not_started',
    interaction_count INT NOT NULL DEFAULT 0 CHECK (interaction_count >= 0),
    last_evaluated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, concept_id)
);
CREATE INDEX IF NOT EXISTS idx_concept_mastery_student ON concept_mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_concept_mastery_status ON concept_mastery(student_id, status);

-- ============================================================================
-- ── MODULE 5: LEARNING HISTORY, GOALS & RECOMMENDATIONS ─────────────────────
-- ============================================================================

-- Table: learning_history (Time-series audit trail of learning actions)
CREATE TABLE IF NOT EXISTS learning_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    action_type VARCHAR(64) NOT NULL, -- 'read_lesson', 'attempted_quiz', 'chat_tutoring'
    duration_minutes INT NOT NULL DEFAULT 1 CHECK (duration_minutes >= 0),
    score_delta NUMERIC(5, 4) DEFAULT 0.0000,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_learning_history_student ON learning_history(student_id, recorded_at DESC);

-- Table: study_goals
CREATE TABLE IF NOT EXISTS study_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type goal_period_type NOT NULL DEFAULT 'weekly',
    target_value NUMERIC(8, 2) NOT NULL CHECK (target_value > 0),
    current_value NUMERIC(8, 2) NOT NULL DEFAULT 0.00 CHECK (current_value >= 0),
    unit VARCHAR(32) NOT NULL DEFAULT 'hours',
    due_date DATE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_study_goals_student ON study_goals(student_id, is_completed);

-- Table: learning_paths
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_ai_generated BOOLEAN NOT NULL DEFAULT TRUE,
    estimated_hours NUMERIC(6, 2) NOT NULL DEFAULT 10.00,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_learning_paths_student ON learning_paths(student_id);

-- Table: learning_path_items (Ordered roadmap milestones)
CREATE TABLE IF NOT EXISTS learning_path_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    concept_id UUID REFERENCES concepts(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    UNIQUE(learning_path_id, order_index)
);
CREATE INDEX IF NOT EXISTS idx_path_items_path_id ON learning_path_items(learning_path_id);

-- Table: weak_concepts
CREATE TABLE IF NOT EXISTS weak_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concept_name VARCHAR(255) NOT NULL,
    subject_area VARCHAR(128) NOT NULL,
    failure_count INT NOT NULL DEFAULT 1 CHECK (failure_count >= 1),
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 0.850 CHECK (confidence_score BETWEEN 0.000 AND 1.000),
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    last_tested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_weak_concepts_student ON weak_concepts(student_id) WHERE is_resolved IS FALSE;

-- Table: recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_type resource_category_type NOT NULL,
    resource_id UUID,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    url VARCHAR(2048),
    reason TEXT NOT NULL,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 0.850,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_recommendations_student ON recommendations(student_id, is_completed, is_dismissed);

-- ============================================================================
-- ── MODULE 6: QUIZ SYSTEM ───────────────────────────────────────────────────
-- ============================================================================

-- Table: quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    quiz_type quiz_category_type NOT NULL DEFAULT 'practice',
    total_questions INT NOT NULL DEFAULT 5 CHECK (total_questions > 0),
    time_limit_seconds INT NOT NULL DEFAULT 300 CHECK (time_limit_seconds > 0),
    passing_score NUMERIC(5, 2) NOT NULL DEFAULT 70.00 CHECK (passing_score BETWEEN 0.00 AND 100.00),
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quizzes_topic_id ON quizzes(topic_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);

-- Table: quiz_questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_format_type NOT NULL DEFAULT 'mcq',
    difficulty question_difficulty_type NOT NULL DEFAULT 'medium',
    concept_tested VARCHAR(255),
    explanation TEXT,
    order_index INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 1 CHECK (points > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);

-- Table: question_options (Multiple choice / Option choices)
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    explanation TEXT,
    order_index SMALLINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_question_options_qid ON question_options(question_id);

-- Table: quiz_attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    time_taken_seconds INT DEFAULT 0 CHECK (time_taken_seconds >= 0),
    score NUMERIC(6, 2) DEFAULT 0.00,
    max_score NUMERIC(6, 2) DEFAULT 0.00,
    percentage NUMERIC(5, 2) DEFAULT 0.00 CHECK (percentage BETWEEN 0.00 AND 100.00),
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_number INT NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id, quiz_id);

-- Table: quiz_answers (Per-question answers submitted in an attempt)
CREATE TABLE IF NOT EXISTS quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
    answer_text TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    time_spent_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt ON quiz_answers(attempt_id);

-- Table: quiz_results (Aggregated evaluation and weak concept identification)
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL UNIQUE REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score NUMERIC(6, 2) NOT NULL,
    max_score NUMERIC(6, 2) NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    weak_concepts_identified TEXT[] DEFAULT ARRAY[]::TEXT[],
    answers_summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON quiz_results(student_id);

-- ============================================================================
-- ── MODULE 7: ANALYTICS ─────────────────────────────────────────────────────
-- ============================================================================

-- Table: student_analytics (Rolling aggregated metrics per student)
CREATE TABLE IF NOT EXISTS student_analytics (
    student_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    quizzes_taken INT NOT NULL DEFAULT 0,
    average_quiz_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    total_study_minutes BIGINT NOT NULL DEFAULT 0,
    mastered_concepts_count INT NOT NULL DEFAULT 0,
    weak_concepts_count INT NOT NULL DEFAULT 0,
    learning_velocity NUMERIC(5, 2) NOT NULL DEFAULT 1.00, -- Concepts mastered / week
    retention_rate NUMERIC(5, 2) NOT NULL DEFAULT 85.00,
    last_computed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: course_analytics (Aggregated instructional health)
CREATE TABLE IF NOT EXISTS course_analytics (
    course_id UUID PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
    active_students INT NOT NULL DEFAULT 0,
    avg_completion_time_days NUMERIC(6, 2) DEFAULT 0.00,
    drop_off_topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    student_satisfaction_score NUMERIC(3, 2) DEFAULT 4.80,
    last_computed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: weekly_progress (Snapshot per student per ISO week)
CREATE TABLE IF NOT EXISTS weekly_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year_week INT NOT NULL, -- e.g. 202645 for Week 45 of 2026
    study_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    quizzes_completed INT NOT NULL DEFAULT 0,
    avg_accuracy NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    xp_earned INT NOT NULL DEFAULT 0,
    daily_distribution JSONB DEFAULT '{"Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, year_week)
);
CREATE INDEX IF NOT EXISTS idx_weekly_progress_student ON weekly_progress(student_id, year_week);

-- Table: monthly_progress (Longitudinal tracking)
CREATE TABLE IF NOT EXISTS monthly_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year_month INT NOT NULL, -- e.g. 202611
    study_hours NUMERIC(7, 2) NOT NULL DEFAULT 0.00,
    concepts_mastered INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, year_month)
);

-- ============================================================================
-- ── MODULE 8: AI, VECTOR EMBEDDINGS & CHAT TUTOR ────────────────────────────
-- ============================================================================

-- Table: chat_sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New AI Tutoring Session',
    session_type VARCHAR(64) NOT NULL DEFAULT 'general',
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    document_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    message_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_student ON chat_sessions(student_id);

-- Table: chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INT,
    sources JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);

-- Table: prompt_history (Audit of all LLM prompts dispatched)
CREATE TABLE IF NOT EXISTS prompt_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    model_name VARCHAR(64) NOT NULL,
    prompt_type VARCHAR(64) NOT NULL, -- 'tutor_question', 'quiz_gen', 'concept_extract'
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_prompt_history_created_at ON prompt_history(created_at);

-- Table: generated_quizzes (Stored raw outputs from LLM QuizGenerator)
CREATE TABLE IF NOT EXISTS generated_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_history_id UUID REFERENCES prompt_history(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    raw_response JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'parsed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: generated_summaries (Flashcards and key point summaries)
CREATE TABLE IF NOT EXISTS generated_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    summary_text TEXT NOT NULL,
    flashcards JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: embeddings (Dedicated Vector Embedding Store for chunks & docs)
CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(64) NOT NULL, -- 'topic', 'lesson', 'uploaded_document'
    source_id UUID NOT NULL,
    chunk_index INT NOT NULL DEFAULT 0,
    chunk_text TEXT NOT NULL,
    vector_data vector(1536) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_embeddings_source ON embeddings(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON embeddings USING hnsw (vector_data vector_cosine_ops);

-- ============================================================================
-- ── MODULE 9: NOTIFICATIONS ─────────────────────────────────────────────────
-- ============================================================================

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    notification_type notification_tone_type NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    action_url VARCHAR(2048),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- Table: notification_preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_daily_digest BOOLEAN NOT NULL DEFAULT TRUE,
    email_quiz_results BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_streak_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_ai_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ── MODULE 10: UPLOADS & OCR EXTRACTION ─────────────────────────────────────
-- ============================================================================

-- Table: uploaded_files
CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type file_format_type NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    storage_url VARCHAR(2048) NOT NULL,
    storage_path VARCHAR(1024) NOT NULL,
    processing_status ocr_processing_type NOT NULL DEFAULT 'pending',
    page_count INT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_uploader ON uploaded_files(uploader_id);

-- Table: extracted_texts (Full extracted text per page or chunk)
CREATE TABLE IF NOT EXISTS extracted_texts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
    page_number INT NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    ocr_confidence NUMERIC(4, 3) DEFAULT 1.000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_extracted_texts_file_id ON extracted_texts(file_id);

-- Table: extracted_concepts (Parsed concepts from file for Knowledge Graph sync)
CREATE TABLE IF NOT EXISTS extracted_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES uploaded_files(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES concepts(id) ON DELETE SET NULL,
    raw_name VARCHAR(255) NOT NULL,
    relevance_score NUMERIC(4, 3) NOT NULL DEFAULT 0.900,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_extracted_concepts_file ON extracted_concepts(file_id);

-- ============================================================================
-- ── MODULE 11: LMS INTEGRATIONS (Google Classroom & Moodle) ─────────────────
-- ============================================================================

-- Table: google_classrooms
CREATE TABLE IF NOT EXISTS google_classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    google_course_id VARCHAR(128) NOT NULL UNIQUE,
    enrollment_code VARCHAR(64),
    last_synced_at TIMESTAMPTZ,
    sync_status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: moodle_courses
CREATE TABLE IF NOT EXISTS moodle_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    moodle_course_id INT NOT NULL UNIQUE,
    moodle_instance_url VARCHAR(2048) NOT NULL,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: lms_sync_logs
CREATE TABLE IF NOT EXISTS lms_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(64) NOT NULL, -- 'google_classroom', 'moodle'
    records_synced INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'success',
    log_detail JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ── 4. AUTOMATED TRIGGERS ───────────────────────────────────────────────────
-- ============================================================================

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER trg_student_profiles_updated_at
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER trg_topics_updated_at
    BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER trg_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER trg_uploaded_files_updated_at
    BEFORE UPDATE ON uploaded_files
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- Trigger Function: Increment Enrolled Count on Course
CREATE OR REPLACE FUNCTION fn_increment_course_enrollment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses
    SET enrolled_count = enrolled_count + 1
    WHERE id = NEW.course_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_enrollment
    AFTER INSERT ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION fn_increment_course_enrollment();

-- Trigger Function: Increment Message Count in Chat Session
CREATE OR REPLACE FUNCTION fn_increment_chat_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions
    SET message_count = message_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_chat_messages
    AFTER INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION fn_increment_chat_message_count();

-- ============================================================================
-- ── 5. PERFORMANCE VIEWS & MATERIALIZED VIEWS ───────────────────────────────
-- ============================================================================

-- View: Complete Student Dashboard Summary
CREATE OR REPLACE VIEW v_student_dashboard_overview AS
SELECT
    u.id AS user_id,
    u.email,
    u.full_name,
    sp.level,
    sp.xp_points,
    sp.streak_days,
    sp.total_study_hours,
    sp.mastery_score,
    COALESCE(ce.active_courses_count, 0) AS active_courses,
    COALESCE(qa.total_quizzes, 0) AS total_quizzes_taken,
    COALESCE(qa.avg_percentage, 0.00) AS quiz_average_score,
    COALESCE(wc.unresolved_weak_count, 0) AS weak_concepts_count
FROM users u
JOIN student_profiles sp ON u.id = sp.user_id
LEFT JOIN (
    SELECT student_id, COUNT(*) AS active_courses_count
    FROM course_enrollments
    WHERE is_completed IS FALSE
    GROUP BY student_id
) ce ON u.id = ce.student_id
LEFT JOIN (
    SELECT student_id, COUNT(*) AS total_quizzes, ROUND(AVG(percentage), 2) AS avg_percentage
    FROM quiz_attempts
    WHERE completed_at IS NOT NULL
    GROUP BY student_id
) qa ON u.id = qa.student_id
LEFT JOIN (
    SELECT student_id, COUNT(*) AS unresolved_weak_count
    FROM weak_concepts
    WHERE is_resolved IS FALSE
    GROUP BY student_id
) wc ON u.id = wc.student_id
WHERE u.deleted_at IS NULL;

-- Materialized View: Course Performance Leaderboards (Refreshed Periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_course_performance_summary AS
SELECT
    c.id AS course_id,
    c.title,
    c.slug,
    c.category,
    c.difficulty,
    c.enrolled_count,
    ROUND(AVG(ce.completion_percentage), 2) AS avg_completion_percentage,
    COUNT(CASE WHEN ce.is_completed THEN 1 END) AS total_graduates
FROM courses c
LEFT JOIN course_enrollments ce ON c.id = ce.course_id
WHERE c.deleted_at IS NULL
GROUP BY c.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_course_perf_id ON mv_course_performance_summary(course_id);

-- ============================================================================
-- ── 6. STORED PROCEDURES / FUNCTIONS ────────────────────────────────────────
-- ============================================================================

-- Stored Function: Award XP and Calculate Auto-Leveling
CREATE OR REPLACE FUNCTION sp_award_student_xp(
    p_student_id UUID,
    p_xp_to_add INT
)
RETURNS TABLE (new_level INT, new_xp BIGINT, leveled_up BOOLEAN) AS $$
DECLARE
    v_old_level INT;
    v_new_level INT;
    v_new_xp BIGINT;
BEGIN
    SELECT level, xp_points INTO v_old_level, v_new_xp
    FROM student_profiles
    WHERE user_id = p_student_id;

    v_new_xp := v_new_xp + p_xp_to_add;
    -- Level algorithm: Level = 1 + floor(XP / 500)
    v_new_level := GREATEST(1, 1 + FLOOR(v_new_xp / 500.0));

    UPDATE student_profiles
    SET xp_points = v_new_xp,
        level = v_new_level,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_student_id;

    RETURN QUERY SELECT v_new_level, v_new_xp, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql;

-- Stored Function: Record Quiz Attempt & Trigger Weak Concept Auto-Detection
CREATE OR REPLACE FUNCTION sp_evaluate_quiz_submission(
    p_attempt_id UUID,
    p_student_id UUID,
    p_score NUMERIC,
    p_max_score NUMERIC,
    p_weak_concepts TEXT[]
)
RETURNS VOID AS $$
DECLARE
    v_pct NUMERIC(5, 2);
    v_passed BOOLEAN;
    v_concept TEXT;
BEGIN
    v_pct := ROUND((p_score / NULLIF(p_max_score, 0)) * 100.0, 2);
    v_passed := (v_pct >= 70.00);

    -- 1. Update attempt
    UPDATE quiz_attempts
    SET score = p_score,
        max_score = p_max_score,
        percentage = v_pct,
        passed = v_passed,
        completed_at = CURRENT_TIMESTAMP
    WHERE id = p_attempt_id;

    -- 2. Insert or update weak concepts
    FOREACH v_concept IN ARRAY p_weak_concepts
    LOOP
        INSERT INTO weak_concepts (student_id, concept_name, subject_area, failure_count, last_tested_at)
        VALUES (p_student_id, v_concept, 'General Assessment', 1, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING;
    END LOOP;

    -- 3. Award XP
    PERFORM sp_award_student_xp(p_student_id, CASE WHEN v_passed THEN 100 ELSE 25 END);
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- ── MODULE 12: HYBRID ARCHITECTURE & TRANSACTIONAL OUTBOX ────────────────────
-- ============================================================================

-- Table: outbox_events
-- Implements the Transactional Outbox Pattern to synchronize PostgreSQL mutations with Neo4j AuraDB.
CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED', 'DEAD_LETTER')),
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 5,
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending_polling ON outbox_events(status, created_at) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON outbox_events(aggregate_type, aggregate_id);

-- Trigger: Automatically stage an outbox event when concept_mastery is updated
CREATE OR REPLACE FUNCTION trg_stage_concept_mastery_outbox()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO outbox_events (
        aggregate_type,
        aggregate_id,
        event_type,
        payload
    ) VALUES (
        'STUDENT',
        NEW.student_id,
        'CONCEPT_MASTERY_UPDATED',
        jsonb_build_object(
            'concept_id', NEW.concept_id,
            'score', NEW.mastery_score,
            'updated_at', CURRENT_TIMESTAMP
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_concept_mastery_sync ON concept_mastery;
CREATE TRIGGER trg_concept_mastery_sync
AFTER INSERT OR UPDATE ON concept_mastery
FOR EACH ROW EXECUTE FUNCTION trg_stage_concept_mastery_outbox();
