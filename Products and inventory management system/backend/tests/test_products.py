import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_product(client: AsyncClient):
    response = await client.post(
        "/api/products/",
        json={
            "name": "Test Laptop",
            "sku": "TLAP001",
            "price": 999.99,
            "quantity_in_stock": 50
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Laptop"
    assert data["sku"] == "TLAP001"
    assert data["price"] == 999.99
    assert data["quantity_in_stock"] == 50
    assert "id" in data

@pytest.mark.asyncio
async def test_create_product_invalid_price(client: AsyncClient):
    response = await client.post(
        "/api/products/",
        json={
            "name": "Invalid Laptop",
            "sku": "TLAP002",
            "price": -10.0,
            "quantity_in_stock": 50
        }
    )
    # Pydantic should catch negative price natively via the schema validation
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_get_products(client: AsyncClient):
    response = await client.get("/api/products/")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert isinstance(data["data"], list)
