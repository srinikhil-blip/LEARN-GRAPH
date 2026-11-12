"""
LearnGraph — Authentication Service
Orchestrates registration, credential validation, JWT token creation,
Neo4j student node initialization, and password management.
"""

from datetime import UTC, datetime
from typing import Optional
from uuid import UUID
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    AccountDisabledError,
    AuthenticationError,
    ConflictError,
    EmailNotVerifiedError,
    InvalidTokenError,
    NotFoundError,
)
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    create_verification_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.graph.graph_service import GraphService
from app.graph.node_models import StudentNode, TeacherNode
from app.models.enums import UserRole
from app.models.student_profile import StudentProfile
from app.models.teacher_profile import TeacherProfile
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.email_service import email_service
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)

logger = structlog.get_logger(__name__)


class AuthService:
    """Core domain service for user authentication and lifecycle."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._user_repo = UserRepository(session)
        self._graph_service = GraphService()

    async def register(self, req: RegisterRequest) -> TokenResponse:
        """Register a new user, create corresponding profile and graph node."""
        # 1. Check existing user
        existing = await self._user_repo.get_by_email(req.email)
        if existing:
            raise ConflictError(f"User with email '{req.email}' already exists")

        # 2. Create User record (unverified by default until email verification link is clicked)
        user = User(
            email=req.email,
            hashed_password=hash_password(req.password),
            full_name=req.full_name,
            role=req.role,
            is_active=True,
            is_verified=False,
        )
        self._session.add(user)
        await self._session.flush()
        await self._session.refresh(user)

        # 3. Create verification token & dispatch verification email
        verification_token = create_verification_token(user.email)
        sent = await email_service.send_verification_email(
            to_email=user.email,
            user_name=user.full_name,
            token=verification_token,
        )
        if not sent:
            logger.error("Verification email dispatch failed", recipient=user.email)
            raise RuntimeError("We couldn't send the verification email. Please try again later.")

        # 3. Create role-specific profile
        if req.role == UserRole.student:
            student_profile = StudentProfile(
                user_id=user.id,
                level=1,
                xp_points=0,
                streak_days=1,
                total_study_hours=0.0,
                mastery_score=0.0,
            )
            self._session.add(student_profile)
            # Create Neo4j graph node
            try:
                await self._graph_service.create_student(
                    StudentNode(
                        id=user.id,
                        email=user.email,
                        name=user.full_name,
                        level=1,
                        xp_points=0,
                        mastery_score=0.0,
                    )
                )
            except Exception as e:
                logger.warning("Graph node creation deferred", error=str(e))
        elif req.role == UserRole.teacher:
            teacher_profile = TeacherProfile(user_id=user.id)
            self._session.add(teacher_profile)

        await self._session.flush()

        # 4. Generate JWT tokens
        access_token = create_access_token(str(user.id), role=user.role)
        refresh_token = create_refresh_token(str(user.id))

        logger.info("User registered successfully", user_id=str(user.id), role=user.role)
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
        )

    async def login(self, req: LoginRequest) -> TokenResponse:
        """Verify user credentials and return access and refresh tokens."""
        user = await self._user_repo.get_by_email(req.email)
        if not user:
            raise AuthenticationError("Invalid email or password")

        if not verify_password(req.password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")

        if not user.is_active:
            raise AccountDisabledError()

        if not user.is_verified:
            raise EmailNotVerifiedError("Please verify your email address before logging in")

        # Update last login timestamp
        user.last_login_at = datetime.now(UTC)
        await self._session.flush()

        access_token = create_access_token(str(user.id), role=user.role)
        refresh_token = create_refresh_token(str(user.id))

        logger.info("User authenticated", user_id=str(user.id))
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
        )

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        """Validate refresh token and issue new token pair."""
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise InvalidTokenError("Invalid token type")

            user_id = payload.get("sub")
            user = await self._user_repo.get_by_id(UUID(user_id))
            if not user or not user.is_active:
                raise AuthenticationError("User not found or disabled")

            new_access = create_access_token(str(user.id), role=user.role)
            new_refresh = create_refresh_token(str(user.id))

            return TokenResponse(
                access_token=new_access,
                refresh_token=new_refresh,
                token_type="bearer",
                expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            )
        except Exception as e:
            raise InvalidTokenError(f"Token refresh failed: {str(e)}")

    async def change_password(self, user_id: UUID, req: ChangePasswordRequest) -> None:
        """Update password after verifying existing password."""
        user = await self._user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")

        if not verify_password(req.current_password, user.hashed_password):
            raise AuthenticationError("Current password incorrect")

        user.hashed_password = hash_password(req.new_password)
        await self._session.flush()
        logger.info("Password updated", user_id=str(user_id))

    async def verify_email(self, token: str) -> None:
        """Verify an account using an email verification token."""
        try:
            payload = decode_token(token)
            if payload.get("type") != "email_verification":
                raise InvalidTokenError("Invalid token type for email verification")

            email = payload.get("sub")
            if not email:
                raise InvalidTokenError("Missing email in token payload")

            user = await self._user_repo.get_by_email(email)
            if not user:
                raise NotFoundError("User not found")

            user.is_verified = True
            await self._session.flush()
            logger.info("Email verified successfully", user_id=str(user.id), email=email)
            return user
        except Exception as e:
            logger.warning("Email verification failed", error=str(e))
            raise InvalidTokenError(f"Verification failed: {str(e)}")

    async def resend_verification(self, email: str) -> str:
        """Issue a fresh verification token for unverified user and dispatch email."""
        user = await self._user_repo.get_by_email(email)
        if not user:
            raise NotFoundError("User not found")

        token = create_verification_token(email)
        sent = await email_service.send_verification_email(
            to_email=user.email,
            user_name=user.full_name,
            token=token,
        )
        if not sent:
            logger.error("Verification email dispatch failed", email=email)
            raise RuntimeError("We couldn't send the verification email. Please try again later.")
        logger.info("Verification email dispatched", email=email)
        return token

    async def forgot_password(self, email: str) -> str:
        """Generate a one-time password reset token for the given email and dispatch email."""
        user = await self._user_repo.get_by_email(email)
        if not user:
            # Don't throw to prevent email enumeration
            logger.info("Forgot password requested for non-existent email", email=email)
            return ""

        token = create_password_reset_token(email)
        await email_service.send_password_reset_email(to_email=user.email, token=token)
        logger.info("Password reset email dispatched", email=email)
        return token

    async def reset_password(self, req: ResetPasswordRequest) -> None:
        """Reset user password using a verified one-time token."""
        try:
            payload = decode_token(req.token)
            if payload.get("type") != "password_reset":
                raise InvalidTokenError("Invalid token type for password reset")

            email = payload.get("sub")
            if not email:
                raise InvalidTokenError("Missing email in token payload")

            user = await self._user_repo.get_by_email(email)
            if not user:
                raise NotFoundError("User not found")

            user.hashed_password = hash_password(req.new_password)
            await self._session.flush()
            logger.info("Password reset completed successfully", user_id=str(user.id), email=email)
        except Exception as e:
            logger.warning("Password reset failed", error=str(e))
            raise InvalidTokenError(f"Password reset failed: {str(e)}")
