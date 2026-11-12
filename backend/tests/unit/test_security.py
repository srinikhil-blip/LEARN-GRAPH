"""
LearnGraph — Security Unit Tests
Validates password hashing and JWT encoding/decoding.
"""

import pytest

from app.core.exceptions import InvalidTokenError, TokenExpiredError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hashing():
    raw = "MySuperSecret123!"
    hashed = hash_password(raw)

    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_create_and_decode_access_token():
    user_id = "11111111-2222-3333-4444-555555555555"
    token = create_access_token(user_id, role="student")

    assert isinstance(token, str)
    payload = decode_token(token)

    assert payload["sub"] == user_id
    assert payload["role"] == "student"
    assert payload["type"] == "access"


def test_create_and_decode_refresh_token():
    user_id = "11111111-2222-3333-4444-555555555555"
    token = create_refresh_token(user_id)

    payload = decode_token(token)
    assert payload["sub"] == user_id
    assert payload["type"] == "refresh"


def test_invalid_token_fails():
    with pytest.raises(InvalidTokenError):
        decode_token("this.is.not.a.valid.jwt.token")
