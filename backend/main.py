"""
LearnGraph Backend — Application Entry Point
FastAPI application factory with all middleware, routers, and lifespan events.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, ORJSONResponse

from app.api.v1 import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.database.session import database_manager
from app.graph.session import graph_manager
from app.middleware.correlation import CorrelationIDMiddleware
from app.middleware.request_logger import RequestLoggingMiddleware
from app.middleware.rate_limiter import RateLimitMiddleware
from app.workers.redis_client import redis_manager

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.
    Handles startup and shutdown of all external connections.
    """
    # ── Startup ───────────────────────────────────────────────
    setup_logging()
    logger.info("Starting LearnGraph backend", version=settings.APP_VERSION)

    # Initialize database connection pool
    try:
        await database_manager.connect()
        logger.info("PostgreSQL connection pool established")
    except Exception as exc:
        logger.warning(f"PostgreSQL unavailable at startup (continuing anyway): {exc}")

    # Initialize Neo4j driver
    try:
        await graph_manager.connect()
        logger.info("Neo4j driver initialized")
    except Exception as exc:
        logger.warning(f"Neo4j unavailable at startup (continuing anyway): {exc}")

    # Initialize Redis connection
    try:
        await redis_manager.connect()
        logger.info("Redis connection established")
    except Exception as exc:
        logger.warning(f"Redis unavailable at startup (continuing anyway): {exc}")

    logger.info(
        "LearnGraph backend ready",
        env=settings.APP_ENV,
        version=settings.APP_VERSION,
    )

    yield  # ── Application runs here ──────────────────────────

    # ── Shutdown ──────────────────────────────────────────────
    logger.info("Shutting down LearnGraph backend")
    await database_manager.disconnect()
    await graph_manager.disconnect()
    await redis_manager.disconnect()
    logger.info("All connections closed. Goodbye.")


def create_application() -> FastAPI:
    """
    FastAPI application factory.
    Returns a fully configured FastAPI instance.
    """
    app = FastAPI(
        title=settings.APP_NAME,
        description=(
            "LearnGraph — Adaptive Knowledge Graph for Continuous Education. "
            "AI-powered learning platform with personalized knowledge graphs, "
            "quiz generation, recommendation engine, and AI tutoring."
        ),
        version=settings.APP_VERSION,
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
        docs_url=f"{settings.API_V1_PREFIX}/docs",
        redoc_url=f"{settings.API_V1_PREFIX}/redoc",
        default_response_class=ORJSONResponse,
        lifespan=lifespan,
        contact={
            "name": "LearnGraph Team",
            "url": "https://learngraph.ai",
            "email": "support@learngraph.ai",
        },
        license_info={
            "name": "MIT",
        },
    )

    # ── Middleware (order matters — outermost executes first) ──
    app.add_middleware(CorrelationIDMiddleware)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    if not settings.DEBUG:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=settings.ALLOWED_HOSTS,
        )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Correlation-ID", "X-Request-ID"],
    )

    # ── Exception Handlers ────────────────────────────────────
    register_exception_handlers(app)

    # Global catch-all handler — logs unexpected errors but never crashes the server
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(
            "unhandled_exception",
            method=request.method,
            url=str(request.url),
            error=str(exc),
            exc_info=True,
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected internal server error occurred."},
        )

    # ── Routers ───────────────────────────────────────────────
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    # ── Health Check ──────────────────────────────────────────
    @app.get("/health", tags=["Health"], summary="Health check endpoint")
    async def health_check() -> dict:
        """Returns the health status of the application and its dependencies."""
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
        }

    @app.get("/", tags=["Root"], include_in_schema=False)
    async def root() -> dict:
        return {
            "message": f"Welcome to {settings.APP_NAME} API",
            "docs": f"{settings.API_V1_PREFIX}/docs",
        }

    return app


app = create_application()
