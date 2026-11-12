"""
LearnGraph — Request Logging Middleware
Measures latency and logs method, path, and response status with structured logging.
"""

import time
from typing import Callable

import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = structlog.get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Emits structured log messages for every HTTP request and records execution duration.
    Skips noisy health-check endpoints.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Ignore health probes to reduce log pollution
        if request.url.path in ("/health", "/"):
            return await call_next(request)

        start_time = time.perf_counter()
        method = request.method
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"

        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            status_code = response.status_code

            log_kwargs = {
                "method": method,
                "path": path,
                "status_code": status_code,
                "duration_ms": duration_ms,
                "client_ip": client_ip,
            }

            if status_code >= 500:
                logger.error("HTTP request error", **log_kwargs)
            elif status_code >= 400:
                logger.warning("HTTP client error", **log_kwargs)
            else:
                logger.info("HTTP request completed", **log_kwargs)

            return response
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.exception(
                "HTTP request unhandled crash",
                method=method,
                path=path,
                duration_ms=duration_ms,
                client_ip=client_ip,
                error=str(exc),
            )
            raise
