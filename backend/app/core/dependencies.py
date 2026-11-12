"""
LearnGraph — Dependency Injection Providers
FastAPI dependency functions for database sessions, current user, role guards, etc.
"""

from typing import Annotated, AsyncGenerator
from uuid import UUID

import structlog
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    AccountDisabledError,
    AuthenticationError,
    EmailNotVerifiedError,
    InsufficientPermissionsError,
    InvalidTokenError,
    TokenExpiredError,
)
from app.core.security import decode_token
from app.database.session import database_manager

logger = structlog.get_logger(__name__)

# ── HTTP Bearer scheme ────────────────────────────────────────
bearer_scheme = HTTPBearer(auto_error=False)


# ── Database Session ──────────────────────────────────────────

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Provide a SQLAlchemy async session per request.
    Automatically commits on success, rolls back on exception.
    """
    async with database_manager.session() as session:
        yield session


DBSession = Annotated[AsyncSession, Depends(get_db)]


# ── Token Extraction ──────────────────────────────────────────

async def get_current_token_payload(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ],
) -> dict:
    """
    Extract and validate the JWT from the Authorization header.
    Returns the decoded token payload.
    """
    if credentials is None:
        raise AuthenticationError("Authorization header is required")

    try:
        payload = decode_token(credentials.credentials)
    except TokenExpiredError:
        raise
    except InvalidTokenError:
        raise

    if payload.get("type") != "access":
        raise InvalidTokenError("Invalid token type — access token required")

    return payload


TokenPayload = Annotated[dict, Depends(get_current_token_payload)]


# ── Current User ──────────────────────────────────────────────

async def get_current_user(
    db: DBSession,
    payload: TokenPayload,
) -> "UserModel":  # type: ignore[name-defined]  # forward ref
    """
    Resolve the current authenticated user from the JWT subject claim.
    Raises HTTP 401 if the user is not found or account is disabled.
    """
    from app.repositories.user_repository import UserRepository

    user_id = payload.get("sub")
    if not user_id:
        raise InvalidTokenError("Token missing user identifier")

    repo = UserRepository(db)
    user = await repo.get_by_id(UUID(user_id))

    if user is None:
        raise AuthenticationError("User not found")
    if not user.is_active:
        raise AccountDisabledError()
    if not user.is_verified:
        raise EmailNotVerifiedError()

    # Attach correlation context for downstream logging
    structlog.contextvars.bind_contextvars(
        user_id=str(user.id),
        user_role=user.role,
    )

    return user


CurrentUser = Annotated["UserModel", Depends(get_current_user)]  # type: ignore[valid-type]


# ── Optional Current User ─────────────────────────────────────

async def get_optional_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ],
    db: DBSession,
) -> "UserModel | None":  # type: ignore[name-defined]
    """Return the current user if authenticated, None otherwise."""
    if credentials is None:
        return None
    try:
        payload = decode_token(credentials.credentials)
        return await get_current_user(db, payload)
    except Exception:
        return None


OptionalUser = Annotated["UserModel | None", Depends(get_optional_user)]  # type: ignore[valid-type]


# ── Role Guards ───────────────────────────────────────────────

def require_roles(*roles: str):
    """
    Factory that returns a dependency enforcing role-based access control.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_roles("admin"))])
    """

    async def role_guard(current_user: CurrentUser) -> "UserModel":  # type: ignore[name-defined]
        if current_user.role not in roles:
            raise InsufficientPermissionsError(
                f"This endpoint requires one of: {', '.join(roles)}"
            )
        return current_user

    return role_guard


require_student = Depends(require_roles("student", "admin"))
require_teacher = Depends(require_roles("teacher", "admin"))
require_admin = Depends(require_roles("admin"))


# ── Pagination ────────────────────────────────────────────────

class PaginationParams:
    """Standard pagination query parameters."""

    def __init__(
        self,
        page: int = 1,
        page_size: int = 20,
    ) -> None:
        self.page = max(1, page)
        self.page_size = min(max(1, page_size), 100)
        self.offset = (self.page - 1) * self.page_size
        self.limit = self.page_size


Pagination = Annotated[PaginationParams, Depends(PaginationParams)]
