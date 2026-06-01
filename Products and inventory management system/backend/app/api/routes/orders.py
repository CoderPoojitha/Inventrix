import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse
from app.services.order_service import OrderService

router = APIRouter()

async def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(db)

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED, summary="Create a new Order")
async def create_order(
    order_in: OrderCreate,
    service: OrderService = Depends(get_order_service)
):
    """
    Creates a new order, validates stock, reduces inventory, and calculates totals.
    If any item is out of stock, the entire transaction is rejected.
    """
    return await service.create_order(order_in)

@router.get("/", response_model=OrderListResponse, summary="Get paginated list of Orders")
async def get_orders(
    limit: int = Query(10, ge=1, le=100, description="Number of records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    customer_id: Optional[uuid.UUID] = Query(None, description="Filter orders by customer ID"),
    service: OrderService = Depends(get_order_service)
):
    """
    Returns a paginated list of orders, optionally filtered by customer_id.
    Includes nested Customer and OrderItem (with Product) details.
    """
    orders, total = await service.get_orders(limit=limit, offset=offset, customer_id=customer_id)
    return OrderListResponse(
        data=orders,
        total=total,
        limit=limit,
        offset=offset
    )

@router.get("/{order_id}", response_model=OrderResponse, summary="Get an Order by ID")
async def get_order(
    order_id: uuid.UUID,
    service: OrderService = Depends(get_order_service)
):
    """
    Retrieves a specific order by its UUID, including nested relations.
    """
    return await service.get_order_by_id(order_id)

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an Order")
async def delete_order(
    order_id: uuid.UUID,
    service: OrderService = Depends(get_order_service)
):
    """
    Deletes an order by its UUID. The inventory of the products in the order
    is restored back to available stock.
    """
    await service.delete_order(order_id)
