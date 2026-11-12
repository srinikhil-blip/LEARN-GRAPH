"""
LearnGraph — Rate Limiting Middleware
Sliding-window rate limiter using Redis for distributed rate enforcement.
Gracefully passes through if Redis is unavailable.
"""

import time
from typing import Callable

import structlog
from fastapi import Request, Response
from fastapi.responses import ORJSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.workers.redis_client import redis_manager

logger = structlog.get_logger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Enforces per-minute IP-based rate limiting across all non-health endpoints.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Exempt health and docs endpoints
        if request.url.path in ("/health", "/", f"{settings.API_V1_PREFIX}/docs", f"{settings.API_V1_PREFIX}/openapi.json"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        current_minute = int(time.time() // 60)
        rate_key = f"rate:{client_ip}:{current_minute}"

        try:
            client = redis_manager.get_client()
            if client:
                requests_count = await client.incr(rate_key)
                if requests_count == 1:
                    await client.expire(rate_key, 60)

                limit = settings.RATE_LIMIT_PER_MINUTE
                if requests_count > limit:
                    logger.warning("Rate limit exceeded", client_ip=client_ip, count=requests_count)
                    return ORJSONResponse(
                        status_code=429,
                        content={
                            "success": False,
                            "error": {
                                "code": "RATE_LIMIT_EXCEEDED",
                                "message": f"Rate limit of {limit} requests per minute exceeded. Try again in 60 seconds.",
                            },
                        },
                        headers={"Retry-After": "60"},
                    )
        except Exception as exc:
            # Degrade gracefully if Redis encounters an issue
            logger.debug("Rate limiting check bypassed due to error", error=str(exc))

        return await call_next(request)
