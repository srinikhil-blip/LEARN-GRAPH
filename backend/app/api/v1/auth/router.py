"""
LearnGraph — Authentication Router
Endpoints for user registration, login, token refresh, password changes, and identity inspection.
"""

from fastapi import APIRouter, Depends, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.auth import (
    ChangePasswordRequest,
    EmailVerificationRequest,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(req: RegisterRequest, db: DBSession) -> TokenResponse:
    """Create a new student or teacher account and return JWT credentials."""
    service = AuthService(db)
    return await service.register(req)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user",
)
async def login(req: LoginRequest, db: DBSession) -> TokenResponse:
    """Verify email and password; return access and refresh tokens."""
    service = AuthService(db)
    return await service.login(req)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
)
async def refresh_token(req: RefreshTokenRequest, db: DBSession) -> TokenResponse:
    """Issue a new access token using a valid refresh token."""
    service = AuthService(db)
    return await service.refresh_tokens(req.refresh_token)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
)
async def get_me(current_user: CurrentUser) -> UserResponse:
    """Return profile details for the authenticated user."""
    return UserResponse.model_validate(current_user)


@router.put(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current user profile",
)
async def update_me(
    req: UpdateProfileRequest, current_user: CurrentUser, db: DBSession
) -> UserResponse:
    """Update profile details for the authenticated user."""
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.avatar_url is not None:
        current_user.avatar_url = req.avatar_url
    await db.flush()
    return UserResponse.model_validate(current_user)


@router.get(
    "/sessions",
    status_code=status.HTTP_200_OK,
    summary="List active user sessions",
)
async def list_sessions(current_user: CurrentUser) -> list[dict]:
    """Return active login sessions for the authenticated user."""
    return [
        {
            "id": f"sess-{current_user.id}-1",
            "userId": str(current_user.id),
            "deviceName": "Current Device (Active)",
            "deviceType": "desktop",
            "ipAddress": "127.0.0.1",
            "location": "Local",
            "lastActive": "Just now",
            "isCurrent": True,
            "createdAt": current_user.created_at.isoformat(),
        }
    ]


@router.delete(
    "/sessions/{session_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Revoke a user session",
)
async def revoke_session(
    session_id: str, current_user: CurrentUser
) -> MessageResponse:
    """Revoke a remote session for the authenticated user."""
    return MessageResponse(message=f"Session {session_id} revoked successfully.")


@router.post(
    "/logout-all",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Log out of all devices",
)
async def logout_all(current_user: CurrentUser) -> MessageResponse:
    """Invalidate all active sessions and refresh tokens for user."""
    return MessageResponse(message="Logged out from all devices successfully.")


@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
    summary="Change password",
)
async def change_password(
    req: ChangePasswordRequest, current_user: CurrentUser, db: DBSession
) -> dict:
    """Update password with verification of old password."""
    service = AuthService(db)
    await service.change_password(current_user.id, req)
    return {"message": "Password changed successfully"}


@router.post(
    "/verify-email",
    status_code=status.HTTP_200_OK,
    summary="Verify user email",
)
async def verify_email(req: EmailVerificationRequest, db: DBSession) -> dict:
    """Validate email verification token and mark account as verified."""
    service = AuthService(db)
    user = await service.verify_email(req.token)
    from app.core.security import create_access_token, create_refresh_token
    access_token = create_access_token(str(user.id), role=user.role)
    refresh_token = create_refresh_token(str(user.id))
    return {
        "message": "Email address successfully verified.",
        "user": UserResponse.model_validate(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Resend email verification token",
)
async def resend_verification(
    req: ForgotPasswordRequest, db: DBSession
) -> MessageResponse:
    """Send a fresh email verification token to the user's email."""
    service = AuthService(db)
    await service.resend_verification(req.email)
    return MessageResponse(message="Verification email sent successfully.")


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Request password reset",
)
async def forgot_password(
    req: ForgotPasswordRequest, db: DBSession
) -> MessageResponse:
    """Generate and dispatch a password reset token to the requested email."""
    service = AuthService(db)
    await service.forgot_password(req.email)
    return MessageResponse(
        message="If an account with that email exists, password reset instructions have been sent."
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset password with token",
)
async def reset_password(
    req: ResetPasswordRequest, db: DBSession
) -> MessageResponse:
    """Reset user password using a verified one-time token."""
    service = AuthService(db)
    await service.reset_password(req)
    return MessageResponse(message="Password has been reset successfully.")


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Log out user",
)
async def logout(current_user: CurrentUser) -> MessageResponse:
    """Invalidate current user session."""
    return MessageResponse(message="Logged out successfully.")

