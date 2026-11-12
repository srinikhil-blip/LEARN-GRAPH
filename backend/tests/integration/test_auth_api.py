"""
LearnGraph — Authentication API Integration Tests
Tests HTTP endpoints via FastAPI TestClient / httpx AsyncClient.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_api_register_and_login(client: AsyncClient):
    # 1. Register endpoint
    reg_payload = {
        "email": "api_user@learngraph.ai",
        "password": "StrongPassword123!",
        "full_name": "API User",
        "role": "student",
    }
    reg_response = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_response.status_code == 201
    data = reg_response.json()
    assert "access_token" in data

    # 2. Login endpoint
    login_payload = {
        "email": "api_user@learngraph.ai",
        "password": "StrongPassword123!",
    }
    login_response = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # 3. Authenticated /me endpoint
    me_response = await client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "api_user@learngraph.ai"


@pytest.mark.asyncio
async def test_api_unauthorized_access_fails(client: AsyncClient):
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 401
