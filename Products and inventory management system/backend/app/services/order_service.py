import uuid
from typing import Tuple, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate

class OrderService:
    """
    Service layer for Orders, handling transactional logic and inventory tracking.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_orders(self, limit: int, offset: int, customer_id: Optional[uuid.UUID] = None) -> Tuple[List[Order], int]:
        """Fetch paginated orders, optionally filtered by customer_id. Eager loads relations."""
        query = select(Order).options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        
        if customer_id:
            query = query.where(Order.customer_id == customer_id)

        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query)

        query = query.limit(limit).offset(offset).order_by(Order.created_at.desc())
        result = await self.db.execute(query)
        orders = result.scalars().all()

        return list(orders), total or 0

    async def get_order_by_id(self, order_id: uuid.UUID) -> Order:
        """Fetch a single order by its UUID with relations eager loaded. Raises 404 if not found."""
        query = select(Order).options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product)
        ).where(Order.id == order_id)
        
        result = await self.db.execute(query)
        order = result.scalar_one_or_none()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with id {order_id} not found."
            )
        return order

    async def create_order(self, order_in: OrderCreate) -> Order:
        """
        Creates a new order. Includes inventory validation, dynamic deduction,
        and transaction rollback on failure.
        """
        # Verify Customer exists
        customer = await self.db.get(Customer, order_in.customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer with id {order_in.customer_id} does not exist."
            )

        new_order = Order(
            customer_id=order_in.customer_id,
            total_amount=0.0
        )
        self.db.add(new_order)
        
        total_amount = 0.0

        for item_in in order_in.items:
            # Fetch product with FOR UPDATE lock to prevent race conditions during checkout
            product_query = select(Product).where(Product.id == item_in.product_id).with_for_update()
            result = await self.db.execute(product_query)
            product = result.scalar_one_or_none()

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product with id {item_in.product_id} does not exist."
                )

            if product.quantity_in_stock < item_in.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for product '{product.name}'. Requested: {item_in.quantity}, Available: {product.quantity_in_stock}."
                )

            # Deduct inventory
            product.quantity_in_stock -= item_in.quantity

            # Create OrderItem
            order_item = OrderItem(
                order=new_order,
                product_id=product.id,
                quantity=item_in.quantity,
                unit_price=product.price
            )
            self.db.add(order_item)
            
            total_amount += float(product.price) * item_in.quantity

        new_order.total_amount = total_amount
        
        await self.db.commit()
        
        # Fetch it back fully eager loaded to return full response
        return await self.get_order_by_id(new_order.id)

    async def delete_order(self, order_id: uuid.UUID) -> None:
        """
        Delete an order by ID.
        Restores the inventory for the items in the order before deleting.
        """
        order = await self.get_order_by_id(order_id)
        
        for item in order.items:
            product_query = select(Product).where(Product.id == item.product_id).with_for_update()
            result = await self.db.execute(product_query)
            product = result.scalar_one_or_none()
            if product:
                product.quantity_in_stock += item.quantity
                
        await self.db.delete(order)
        await self.db.commit()
