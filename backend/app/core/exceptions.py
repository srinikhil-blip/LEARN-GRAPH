"""
LearnGraph — Custom Exception Classes and Global Exception Handlers
Provides structured error responses across all API endpoints.
"""

from typing import Any, Optional

import structlog
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import ORJSONResponse
from sqlalchemy.exc import IntegrityError, NoResultFound

logger = structlog.get_logger(__name__)


# ── Base Exception ────────────────────────────────────────────

class LearnGraphException(Exception):
    """Base exception for all LearnGraph custom errors."""

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code: str = "INTERNAL_ERROR"
    message: str = "An unexpected error occurred"

    def __init__(
        self,
        message: Optional[str] = None,
        *,
        detail: Optional[Any] = None,
    ) -> None:
        self.message = message or self.__class__.message
        self.detail = detail
        super().__init__(self.message)


# ── Authentication Exceptions ─────────────────────────────────

class AuthenticationError(LearnGraphException):
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "AUTHENTICATION_FAILED"
    message = "Authentication failed"


class InvalidTokenError(LearnGraphException):
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "INVALID_TOKEN"
    message = "Invalid or malformed token"


class TokenExpiredError(LearnGraphException):
    status_code = status.HTTP_401_UNAUTHORIZED
    error_code = "TOKEN_EXPIRED"
    message = "Token has expired"


class InsufficientPermissionsError(LearnGraphException):
    status_code = status.HTTP_403_FORBIDDEN
    error_code = "INSUFFICIENT_PERMISSIONS"
    message = "You do not have permission to perform this action"


class AccountDisabledError(LearnGraphException):
    status_code = status.HTTP_403_FORBIDDEN
    error_code = "ACCOUNT_DISABLED"
    message = "Your account has been disabled"


class EmailNotVerifiedError(LearnGraphException):
    status_code = status.HTTP_403_FORBIDDEN
    error_code = "EMAIL_NOT_VERIFIED"
    message = "Please verify your email address"


# ── Resource Exceptions ───────────────────────────────────────

class NotFoundError(LearnGraphException):
    status_code = status.HTTP_404_NOT_FOUND
    error_code = "NOT_FOUND"
    message = "Resource not found"


class ConflictError(LearnGraphException):
    status_code = status.HTTP_409_CONFLICT
    error_code = "CONFLICT"
    message = "Resource already exists"


class ValidationError(LearnGraphException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    error_code = "VALIDATION_ERROR"
    message = "Validation failed"


# ── Database Exceptions ───────────────────────────────────────

class DatabaseError(LearnGraphException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = "DATABASE_ERROR"
    message = "A database error occurred"


class DuplicateEntryError(LearnGraphException):
    status_code = status.HTTP_409_CONFLICT
    error_code = "DUPLICATE_ENTRY"
    message = "A record with this value already exists"


# ── Graph Exceptions ──────────────────────────────────────────

class GraphError(LearnGraphException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_code = "GRAPH_ERROR"
    message = "Knowledge graph operation failed"


class GraphNodeNotFoundError(LearnGraphException):
    status_code = status.HTTP_404_NOT_FOUND
    error_code = "GRAPH_NODE_NOT_FOUND"
    message = "Graph node not found"


# ── AI Exceptions ─────────────────────────────────────────────

class AIServiceError(LearnGraphException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    error_code = "AI_SERVICE_ERROR"
    message = "AI service is currently unavailable"


class QuotaExceededError(LearnGraphException):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    error_code = "QUOTA_EXCEEDED"
    message = "AI service quota exceeded"


# ── Rate Limiting ─────────────────────────────────────────────

class RateLimitError(LearnGraphException):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    error_code = "RATE_LIMIT_EXCEEDED"
    message = "Too many requests. Please slow down."


# ── File Exceptions ───────────────────────────────────────────

class FileTooLargeError(LearnGraphException):
    status_code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
    error_code = "FILE_TOO_LARGE"
    message = "Uploaded file exceeds the size limit"


class UnsupportedFileTypeError(LearnGraphException):
    status_code = status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
    error_code = "UNSUPPORTED_FILE_TYPE"
    message = "This file type is not supported"


# ── Response Builder ──────────────────────────────────────────

def _error_response(
    status_code: int,
    error_code: str,
    message: str,
    detail: Any = None,
) -> ORJSONResponse:
    content = {
        "success": False,
        "error": {
            "code": error_code,
            "message": message,
        },
    }
    if detail is not None:
        content["error"]["detail"] = detail  # type: ignore[index]
    return ORJSONResponse(status_code=status_code, content=content)


# ── Exception Handlers ────────────────────────────────────────

def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the FastAPI app."""

    @app.exception_handler(LearnGraphException)
    async def learngraph_exception_handler(
        request: Request, exc: LearnGraphException
    ) -> ORJSONResponse:
        logger.warning(
            "Application exception",
            error_code=exc.error_code,
            message=exc.message,
            path=request.url.path,
        )
        return _error_response(
            exc.status_code, exc.error_code, exc.message, exc.detail
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> ORJSONResponse:
        errors = []
        for error in exc.errors():
            errors.append(
                {
                    "field": " → ".join(str(loc) for loc in error["loc"]),
                    "message": error["msg"],
                    "type": error["type"],
                }
            )
        logger.info("Validation error", path=request.url.path, errors=errors)
        return _error_response(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "VALIDATION_ERROR",
            "Request validation failed",
            errors,
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(
        request: Request, exc: IntegrityError
    ) -> ORJSONResponse:
        logger.error("Database integrity error", error=str(exc), path=request.url.path)
        return _error_response(
            status.HTTP_409_CONFLICT,
            "DUPLICATE_ENTRY",
            "A record with this value already exists",
        )

    @app.exception_handler(NoResultFound)
    async def no_result_handler(
        request: Request, exc: NoResultFound
    ) -> ORJSONResponse:
        return _error_response(
            status.HTTP_404_NOT_FOUND,
            "NOT_FOUND",
            "Resource not found",
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(
        request: Request, exc: Exception
    ) -> ORJSONResponse:
        logger.error(
            "Unhandled exception",
            error=str(exc),
            exc_type=type(exc).__name__,
            path=request.url.path,
        )
        return _error_response(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "INTERNAL_ERROR",
            "An unexpected error occurred. Please try again.",
        )
