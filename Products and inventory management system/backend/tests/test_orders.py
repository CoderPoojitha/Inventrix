import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_order_success(client: AsyncClient):
    # 1. Create a Product
    prod_resp = await client.post(
        "/api/products/",
        json={"name": "Order Laptop", "sku": "OLAP001", "price": 1000.0, "quantity_in_stock": 10}
    )
    assert prod_resp.status_code == 201
    product_id = prod_resp.json()["id"]

    # 2. Create a Customer
    cust_resp = await client.post(
        "/api/customers/",
        json={"full_name": "Order Customer", "email": "order.customer@example.com"}
    )
    assert cust_resp.status_code == 201
    customer_id = cust_resp.json()["id"]

    # 3. Create the Order
    order_resp = await client.post(
        "/api/orders/",
        json={
            "customer_id": customer_id,
            "items": [
                {"product_id": product_id, "quantity": 2}
            ]
        }
    )
    assert order_resp.status_code == 201
    order_data = order_resp.json()
    
    # Assert Total Amount (1000.0 * 2)
    assert order_data["total_amount"] == 2000.0
    assert len(order_data["items"]) == 1
    assert order_data["items"][0]["quantity"] == 2
    assert order_data["items"][0]["unit_price"] == 1000.0

    # 4. Verify Inventory Deduction
    prod_check = await client.get(f"/api/products/{product_id}")
    assert prod_check.status_code == 200
    # Original stock 10 - 2 ordered = 8 remaining
    assert prod_check.json()["quantity_in_stock"] == 8

@pytest.mark.asyncio
async def test_create_order_insufficient_stock(client: AsyncClient):
    # 1. Create a Product with limited stock
    prod_resp = await client.post(
        "/api/products/",
        json={"name": "Limited Phone", "sku": "LPHN001", "price": 500.0, "quantity_in_stock": 5}
    )
    product_id = prod_resp.json()["id"]

    # 2. Create a Customer
    cust_resp = await client.post(
        "/api/customers/",
        json={"full_name": "Greedy Customer", "email": "greedy.customer@example.com"}
    )
    customer_id = cust_resp.json()["id"]

    # 3. Attempt to Order MORE than available stock
    order_resp = await client.post(
        "/api/orders/",
        json={
            "customer_id": customer_id,
            "items": [
                {"product_id": product_id, "quantity": 10} # Requesting 10, only 5 available
            ]
        }
    )
    # Should throw Business Validation Exception (400 Bad Request)
    assert order_resp.status_code == 400
    assert "Insufficient stock" in order_resp.json()["message"]

    # 4. Verify Transaction Rollback (Inventory should NOT be deducted)
    prod_check = await client.get(f"/api/products/{product_id}")
    assert prod_check.status_code == 200
    assert prod_check.json()["quantity_in_stock"] == 5
