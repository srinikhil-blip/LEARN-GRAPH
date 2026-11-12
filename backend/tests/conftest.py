"""
LearnGraph — Pytest Test Configuration & Fixtures
Async testing setup with mocked services and SQLite/in-memory SQLite session override.
"""

import asyncio
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.security import create_access_token, hash_password
from app.database.base import Base
from app.database.session import database_manager
from app.models.enums import UserRole
from app.models.student_profile import StudentProfile
from app.models.user import User
from main import app

# Test SQLite in-memory async database
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def test_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a fresh, clean in-memory database session for each test."""
    engine = create_async_engine(TEST_DB_URL, echo=False)
    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with session_factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def client(test_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Test HTTP client with database dependency overridden."""
    from app.core.dependencies import get_db

    async def override_get_db():
        yield test_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def sample_student(test_session: AsyncSession) -> User:
    """Fixture creating a verified student in the database."""
    user = User(
        email="test_student@learngraph.ai",
        hashed_password=hash_password("Password123!"),
        full_name="Test Student",
        role=UserRole.student,
        is_active=True,
        is_verified=True,
    )
    test_session.add(user)
    await test_session.flush()

    profile = StudentProfile(user_id=user.id, level=1, xp_points=0)
    test_session.add(profile)
    await test_session.commit()
    await test_session.refresh(user)
    return user


@pytest.fixture
def student_auth_headers(sample_student: User) -> dict:
    """Authorization header containing a valid JWT for the sample student."""
    token = create_access_token(str(sample_student.id), role=sample_student.role)
    return {"Authorization": f"Bearer {token}"}
