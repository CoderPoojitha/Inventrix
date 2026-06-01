from typing import List
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class LowStockProduct(BaseModel):
    """Schema for a lightweight product representation in the dashboard."""
    id: UUID
    name: str
    sku: str
    quantity_in_stock: int
    
    model_config = ConfigDict(from_attributes=True)

class DashboardSummaryResponse(BaseModel):
    """Schema for the main dashboard metrics response."""
    total_products: int
    total_customers: int
    total_orders: int
    total_inventory_value: float
    low_stock_products: List[LowStockProduct]
