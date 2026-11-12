# LearnGraph Backend — Production AI Platform

**Adaptive Knowledge Graph for Continuous Education**  
Enterprise-grade cloud-native backend powering hyper-personalized curriculum roadmaps, AI diagnostics, real-time tutoring, and interactive knowledge graphs.

---

## 🏛 Architecture & Tech Stack

- **Framework**: Python 3.12 + FastAPI (Async, Clean Architecture, Dependency Injection)
- **Primary Database**: PostgreSQL 16 with `pgvector` for semantic concept embeddings
- **ORM**: SQLAlchemy 2.0 (Async) + Alembic migrations
- **Knowledge Graph**: Neo4j 5 (AuraDB / Bolt) for prerequisite DAGs, mastery topology, and traversal
- **Caching & Rate Limiting**: Redis 7
- **Authentication**: JWT (Access + Refresh) + bcrypt password hashing + Role-Based Access Control (Student / Teacher / Admin)
- **AI & Graph AI**:
  - OpenAI GPT-4o & text-embedding-3-small
  - Google Gemini 1.5 Pro
  - LangGraph for multi-stage adaptive AI tutor workflows
- **Document Processing**: PyMuPDF (fitz) + Tesseract OCR
- **Asynchronous Workers**: Celery + Redis broker
- **Containerization**: Multi-stage Docker + Docker Compose

---

## 🚀 Quick Start (Local Docker Stack)

### 1. Clone & Setup Environment
```bash
cd backend
cp .env.example .env
# Fill in your OPENAI_API_KEY, GEMINI_API_KEY, and secrets in .env
```

### 2. Start Full Stack with Docker Compose
```bash
docker-compose up -d
```
This boots:
- **FastAPI API**: http://localhost:8000
- **Swagger Documentation**: http://localhost:8000/api/v1/docs
- **ReDoc Documentation**: http://localhost:8000/api/v1/redoc
- **PostgreSQL (pgvector)**: `localhost:5432`
- **Neo4j AuraDB Local**: `localhost:7474` (UI) / `localhost:7687` (Bolt)
- **Redis**: `localhost:6379`
- **Flower (Celery dashboard)**: http://localhost:5555

### 3. Initialize & Seed Database
```bash
# Apply schema and create default admin
python scripts/init_db.py

# Seed sample courses, topics, and student progress matching React UI
python scripts/seed_data.py
```

Default seeded student credentials:
- **Email**: `alex@university.edu`
- **Password**: `password123`

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── ai/                  # AI services (Concept Extractor, Quiz Generator, LangGraph, etc.)
│   ├── api/
│   │   └── v1/              # Versioned API routes (auth, students, courses, quiz, graph, etc.)
│   ├── core/                # Configuration, security, dependencies, and exceptions
│   ├── database/            # Async SQLAlchemy engine and Base model mixins
│   ├── graph/               # Neo4j driver, Cypher schema constraints, and GraphService
│   ├── middleware/          # Correlation ID, Request Logger, Rate Limiter
│   ├── models/              # SQLAlchemy 2.0 ORM models (Users, Courses, Quizzes, etc.)
│   ├── repositories/        # Repository pattern data access layer
│   ├── schemas/             # Pydantic v2 validation and serialization models
│   ├── services/            # Clean architecture domain business logic
│   └── workers/             # Celery background tasks & Redis client
├── migrations/              # Alembic async migration versions
├── scripts/                 # Database initialization and mock data seeders
├── tests/                   # Pytest async unit and integration tests
├── Dockerfile               # Multi-stage production container
├── docker-compose.yml       # Local developer orchestration stack
├── requirements.txt         # Pinned production Python dependencies
└── main.py                  # Application entrypoint & lifespan manager
```

---

## 🧪 Running Tests

```bash
pytest tests/ -v --cov=app --cov-report=term-missing
```

---

## 🌐 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new student/teacher account |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT token pair |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/v1/students/dashboard` | Student KPIs, weak concepts, and study streak |
| `GET` | `/api/v1/knowledge-graph/student` | Full React Flow graph nodes & edges |
| `POST` | `/api/v1/quiz/generate` | AI-generated adaptive quiz for weak areas |
| `POST` | `/api/v1/quiz/submit` | Evaluate quiz, award XP, update graph mastery |
| `GET` | `/api/v1/recommendations` | Next best actions from graph + quiz errors |
| `POST` | `/api/v1/chat/sessions` | Create AI Tutor session |
| `WS` | `/api/v1/chat/ws/{id}` | Realtime streaming AI tutor conversation |
| `POST` | `/api/v1/uploads` | Upload and OCR educational PDF documents |

---

## ☁ Deployment

### Deploy on Railway / Render
1. Push the `backend/` directory to your Git repository.
2. Link a managed PostgreSQL (with `pgvector`) and Redis instance.
3. Supply environment variables configured in `.env.example`.
4. Run `python scripts/init_db.py` in the release phase.
5. Launch command: `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4`.
