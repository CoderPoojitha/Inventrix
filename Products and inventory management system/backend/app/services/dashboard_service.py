import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.dashboard import DashboardSummaryResponse

class DashboardService:
    """
    Service layer for compiling dashboard metrics concurrently.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_summary(self) -> DashboardSummaryResponse:
        """
        Calculates and returns the dashboard summary metrics.
        Executes independent queries concurrently for optimal performance.
        """
        # Define the individual async queries
        async def get_total_products():
            return await self.db.scalar(select(func.count()).select_from(Product)) or 0
            
        async def get_total_customers():
            return await self.db.scalar(select(func.count()).select_from(Customer)) or 0
            
        async def get_total_orders():
            return await self.db.scalar(select(func.count()).select_from(Order)) or 0
            
        async def get_total_inventory_value():
            result = await self.db.scalar(select(func.sum(Product.price * Product.quantity_in_stock)))
            return round(float(result), 2) if result else 0.0
            
        async def get_low_stock_products():
            # Get products with strictly less than 10 stock, ordered ascending by stock
            query = select(Product).where(Product.quantity_in_stock < 10).order_by(Product.quantity_in_stock.asc())
            result = await self.db.execute(query)
            return result.scalars().all()

        # Execute all queries sequentially (SQLAlchemy AsyncSession does not support concurrent execution on the same connection)
        total_products = await get_total_products()
        total_customers = await get_total_customers()
        total_orders = await get_total_orders()
        total_inventory_value = await get_total_inventory_value()
        low_stock_products = await get_low_stock_products()

        return DashboardSummaryResponse(
            total_products=total_products,
            total_customers=total_customers,
            total_orders=total_orders,
            total_inventory_value=total_inventory_value,
            low_stock_products=list(low_stock_products)
        )
