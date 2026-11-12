"""
LearnGraph — Authentication Pydantic Schemas
Pydantic v2 request/response models for all auth-related endpoints.
"""

import re
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)

from app.models.enums import UserRole

# ── Password Complexity ───────────────────────────────────────────────────────

_PASSWORD_MIN_LENGTH = 8
_PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#^])[A-Za-z\d@$!%*?&_\-#^]{8,}$"
)


def _validate_password_complexity(value: str) -> str:
    """Enforce password complexity: min 8 chars, upper, lower, digit, special."""
    if len(value) < _PASSWORD_MIN_LENGTH:
        raise ValueError(
            f"Password must be at least {_PASSWORD_MIN_LENGTH} characters long."
        )
    if not _PASSWORD_REGEX.match(value):
        raise ValueError(
            "Password must contain at least one uppercase letter, one lowercase letter, "
            "one digit, and one special character (@$!%*?&_-#^)."
        )
    return value


# ── Registration ──────────────────────────────────────────────────────────────


class RegisterRequest(BaseModel):
    """Request body for user registration."""

    model_config = ConfigDict(from_attributes=True)

    email: EmailStr = Field(..., description="User's email address (must be unique).")
    password: str = Field(
        ...,
        min_length=8,
        description="Plain-text password (min 8 chars, mixed case + digit + special).",
    )
    full_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=150,
        description="User's display name.",
    )
    name: Optional[str] = Field(
        default=None,
        description="Alias for full_name.",
    )
    role: UserRole = Field(
        default=UserRole.student,
        description="Account role: student (default), teacher, or admin.",
    )

    @model_validator(mode="before")
    @classmethod
    def handle_name_alias(cls, values: dict) -> dict:
        if isinstance(values, dict):
            if "name" in values and ("full_name" not in values or not values.get("full_name")):
                values["full_name"] = values["name"]
        return values

    @field_validator("password")
    @classmethod
    def password_complexity(cls, value: str) -> str:
        return _validate_password_complexity(value)

    @field_validator("full_name")
    @classmethod
    def full_name_strip(cls, value: Optional[str]) -> str:
        stripped = (value or "").strip()
        if not stripped:
            raise ValueError("full_name cannot be blank.")
        return stripped


# ── Login ─────────────────────────────────────────────────────────────────────


class LoginRequest(BaseModel):
    """Request body for credential-based login."""

    model_config = ConfigDict(from_attributes=True)

    email: EmailStr = Field(..., description="Registered email address.")
    password: str = Field(..., description="Plain-text password.")


# ── Token Responses ───────────────────────────────────────────────────────────


class TokenResponse(BaseModel):
    """Response body returned on successful authentication."""

    model_config = ConfigDict(from_attributes=True)

    access_token: str = Field(..., description="Short-lived JWT access token.")
    refresh_token: str = Field(..., description="Long-lived JWT refresh token.")
    token_type: str = Field(default="bearer", description="OAuth2 token type.")
    expires_in: int = Field(
        ..., description="Access token lifetime in seconds."
    )
    user: Optional["UserResponse"] = Field(
        default=None, description="Authenticated user profile."
    )


# ── Token Refresh ─────────────────────────────────────────────────────────────


class RefreshTokenRequest(BaseModel):
    """Request body to exchange a refresh token for a new token pair."""

    model_config = ConfigDict(from_attributes=True)

    refresh_token: str = Field(..., description="Valid JWT refresh token.")


# ── Password Management ───────────────────────────────────────────────────────


class ForgotPasswordRequest(BaseModel):
    """Request body for initiating a password reset flow."""

    model_config = ConfigDict(from_attributes=True)

    email: EmailStr = Field(..., description="Email address tied to the account.")


class ResetPasswordRequest(BaseModel):
    """Request body for completing a password reset using a one-time token."""

    model_config = ConfigDict(from_attributes=True)

    token: str = Field(..., description="Password reset token from the email link.")
    new_password: str = Field(..., min_length=8, description="New plain-text password.")
    confirm_password: str = Field(..., description="Must match new_password exactly.")

    @field_validator("new_password")
    @classmethod
    def password_complexity(cls, value: str) -> str:
        return _validate_password_complexity(value)

    @model_validator(mode="after")
    def passwords_match(self) -> "ResetPasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("new_password and confirm_password do not match.")
        return self


class ChangePasswordRequest(BaseModel):
    """Request body for an authenticated user changing their own password."""

    model_config = ConfigDict(from_attributes=True)

    current_password: str = Field(..., description="Current plain-text password.")
    new_password: str = Field(..., min_length=8, description="New plain-text password.")
    confirm_password: str = Field(..., description="Must match new_password exactly.")

    @field_validator("new_password")
    @classmethod
    def password_complexity(cls, value: str) -> str:
        return _validate_password_complexity(value)

    @model_validator(mode="after")
    def passwords_match(self) -> "ChangePasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("new_password and confirm_password do not match.")
        return self


# ── Email Verification ────────────────────────────────────────────────────────


class EmailVerificationRequest(BaseModel):
    """Request body for verifying an email address via a token link."""

    model_config = ConfigDict(from_attributes=True)

    token: str = Field(
        ..., description="Email verification token received in the verification email."
    )


# ── User Profile Response ─────────────────────────────────────────────────────


class UserResponse(BaseModel):
    """
    Serialised user profile returned from authenticated endpoints.
    Maps directly from the SQLAlchemy User ORM model via from_attributes=True.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID = Field(..., description="Unique user identifier (UUID v4).")
    email: EmailStr = Field(..., description="User's verified email address.")
    full_name: str = Field(..., description="User's display name.")
    role: UserRole = Field(..., description="Account role.")
    is_active: bool = Field(..., description="Whether the account is enabled.")
    is_verified: bool = Field(..., description="Whether the email has been verified.")
    name: Optional[str] = Field(None, description="Display name alias for frontend.")
    emailVerified: Optional[bool] = Field(None, description="Camel-case verification flag for frontend.")
    avatar_url: Optional[str] = Field(None, description="URL to the user's avatar image.")
    created_at: datetime = Field(..., description="Timestamp when the account was created.")

    @model_validator(mode="after")
    def populate_camel_fields(self) -> "UserResponse":
        if self.name is None:
            self.name = self.full_name
        if self.emailVerified is None:
            self.emailVerified = self.is_verified
        return self


# ── Profile Update ────────────────────────────────────────────────────────────


class UpdateProfileRequest(BaseModel):
    """Request body for updating an authenticated user's profile details."""

    model_config = ConfigDict(from_attributes=True)

    full_name: Optional[str] = Field(
        None, min_length=2, max_length=150, description="Updated display name."
    )
    avatar_url: Optional[str] = Field(
        None, max_length=2048, description="New avatar image URL."
    )

    @field_validator("full_name", mode="before")
    @classmethod
    def strip_full_name(cls, value: Optional[str]) -> Optional[str]:
        if value is not None:
            value = value.strip()
            if not value:
                raise ValueError("full_name cannot be blank.")
        return value


# ── Message Response Helpers ──────────────────────────────────────────────────


class MessageResponse(BaseModel):
    """Generic single-message response payload."""

    model_config = ConfigDict(from_attributes=True)

    message: str = Field(..., description="Human-readable status message.")
