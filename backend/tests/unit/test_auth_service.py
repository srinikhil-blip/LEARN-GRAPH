"""
LearnGraph — Authentication Service Unit Tests
Validates user registration, password verification, and token exchange.
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError, ConflictError
from app.models.enums import UserRole
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.auth_service import AuthService


@pytest.mark.asyncio
async def test_register_new_student(test_session: AsyncSession):
    service = AuthService(test_session)
    req = RegisterRequest(
        email="new_student@learngraph.ai",
        password="ValidPassword123!",
        full_name="New Student",
        role=UserRole.student,
    )
    tokens = await service.register(req)

    assert tokens.access_token is not None
    assert tokens.refresh_token is not None
    assert tokens.token_type == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email_fails(test_session: AsyncSession):
    service = AuthService(test_session)
    req = RegisterRequest(
        email="duplicate@learngraph.ai",
        password="ValidPassword123!",
        full_name="Duplicate Student",
        role=UserRole.student,
    )
    await service.register(req)

    with pytest.raises(ConflictError):
        await service.register(req)


@pytest.mark.asyncio
async def test_login_success(test_session: AsyncSession):
    service = AuthService(test_session)
    # Register first
    await service.register(
        RegisterRequest(
            email="login_test@learngraph.ai",
            password="ValidPassword123!",
            full_name="Login Test",
            role=UserRole.student,
        )
    )

    # Login
    login_res = await service.login(
        LoginRequest(email="login_test@learngraph.ai", password="ValidPassword123!")
    )
    assert login_res.access_token is not None


@pytest.mark.asyncio
async def test_login_invalid_password_fails(test_session: AsyncSession):
    service = AuthService(test_session)
    await service.register(
        RegisterRequest(
            email="invalid_pass@learngraph.ai",
            password="ValidPassword123!",
            full_name="Invalid Pass",
            role=UserRole.student,
        )
    )

    with pytest.raises(AuthenticationError):
        await service.login(
            LoginRequest(email="invalid_pass@learngraph.ai", password="WrongPassword123!")
        )
