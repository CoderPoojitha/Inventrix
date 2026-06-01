import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_customer(client: AsyncClient):
    response = await client.post(
        "/api/customers/",
        json={
            "full_name": "John Doe",
            "email": "john.doe@example.com",
            "phone_number": "555-1234"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["full_name"] == "John Doe"
    assert data["email"] == "john.doe@example.com"
    assert "id" in data

@pytest.mark.asyncio
async def test_duplicate_email(client: AsyncClient):
    # First creation should succeed
    response1 = await client.post(
        "/api/customers/",
        json={
            "full_name": "Jane Doe",
            "email": "jane.doe@example.com"
        }
    )
    assert response1.status_code == 201

    # Second creation with same email should fail (400 Bad Request depending on implementation)
    # This validates our Service layer exception throwing
    response2 = await client.post(
        "/api/customers/",
        json={
            "full_name": "Jane Duplicate",
            "email": "jane.doe@example.com"
        }
    )
    assert response2.status_code == 400
    assert response2.json()["success"] is False
