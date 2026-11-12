"""
LearnGraph — Async SQLAlchemy Session Manager
Manages the connection pool and provides per-request sessions.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.core.config import settings

logger = structlog.get_logger(__name__)


class DatabaseManager:
    """
    Manages the SQLAlchemy async engine and session factory.
    Implements the connection pool lifecycle.
    """

    def __init__(self) -> None:
        self._engine = None
        self._session_factory = None

    async def connect(self) -> None:
        """Initialize the async engine and session factory."""
        pool_kwargs: dict = {}

        # Use NullPool in test environments to avoid connection leaks
        if settings.APP_ENV == "testing":
            pool_kwargs["poolclass"] = NullPool

        try:
            self._engine = create_async_engine(
                settings.async_database_url,
                echo=settings.DEBUG,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                pool_timeout=30,
                pool_recycle=1800,  # Recycle connections every 30 min
                **pool_kwargs,
            )

            self._session_factory = async_sessionmaker(
                bind=self._engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autocommit=False,
                autoflush=False,
            )

            logger.info("Database engine initialized", url=settings.POSTGRES_HOST)
        except Exception as exc:
            logger.warning(
                "database_manager.connect: PostgreSQL unavailable at startup (continuing anyway)",
                error=str(exc),
            )

    async def disconnect(self) -> None:
        """Dispose the connection pool on application shutdown."""
        if self._engine:
            await self._engine.dispose()
            logger.info("Database engine disposed")

    @asynccontextmanager
    async def session(self) -> AsyncGenerator[AsyncSession, None]:
        """
        Async context manager providing a database session.
        Commits on success, rolls back on any exception.
        """
        if self._session_factory is None:
            raise RuntimeError("Database not connected. Call connect() first.")

        async with self._session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """FastAPI-compatible dependency generator."""
        async with self.session() as session:
            yield session


# Global singleton — initialized during application lifespan
database_manager = DatabaseManager()
