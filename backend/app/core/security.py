"""
LearnGraph — Security Utilities
JWT token creation/validation, password hashing, and token blacklisting.
"""

from datetime import UTC, datetime, timedelta
from typing import Any, Optional
from uuid import uuid4

import structlog
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.exceptions import (
    InvalidTokenError,
    TokenExpiredError,
)

logger = structlog.get_logger(__name__)

# ── Password Hashing ──────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT Token Management ──────────────────────────────────────

def create_access_token(
    subject: str,
    *,
    role: str = "student",
    extra_claims: Optional[dict[str, Any]] = None,
) -> str:
    """
    Create a signed JWT access token.

    Args:
        subject: User ID (UUID string) to encode as the token subject.
        role: User role (student | teacher | admin).
        extra_claims: Optional additional claims to include.

    Returns:
        Signed JWT access token string.
    """
    expire = datetime.now(UTC) + timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": datetime.now(UTC),
        "exp": expire,
        "jti": str(uuid4()),
        "type": "access",
        "role": role,
    }
    if extra_claims:
        payload.update(extra_claims)

    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    logger.debug("Access token created", subject=subject, role=role, expires=expire)
    return token


def create_refresh_token(subject: str) -> str:
    """
    Create a signed JWT refresh token with longer expiry.

    Args:
        subject: User ID (UUID string).

    Returns:
        Signed JWT refresh token string.
    """
    expire = datetime.now(UTC) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": datetime.now(UTC),
        "exp": expire,
        "jti": str(uuid4()),
        "type": "refresh",
    }
    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT token.

    Args:
        token: JWT token string.

    Returns:
        Token payload dictionary.

    Raises:
        TokenExpiredError: If token has expired.
        InvalidTokenError: If token is invalid or malformed.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError as e:
        error_msg = str(e)
        if "expired" in error_msg.lower():
            raise TokenExpiredError("Access token has expired")
        raise InvalidTokenError(f"Invalid token: {error_msg}")


def get_token_subject(token: str) -> str:
    """Extract the subject (user ID) from a token."""
    payload = decode_token(token)
    sub = payload.get("sub")
    if not sub:
        raise InvalidTokenError("Token missing subject claim")
    return sub


def create_verification_token(email: str) -> str:
    """Create a short-lived email verification token."""
    expire = datetime.now(UTC) + timedelta(hours=24)
    payload = {
        "sub": email,
        "exp": expire,
        "type": "email_verification",
        "jti": str(uuid4()),
    }
    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_password_reset_token(email: str) -> str:
    """Create a short-lived password reset token."""
    expire = datetime.now(UTC) + timedelta(hours=1)
    payload = {
        "sub": email,
        "exp": expire,
        "type": "password_reset",
        "jti": str(uuid4()),
    }
    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
