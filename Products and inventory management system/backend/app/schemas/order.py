from typing import List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

from app.schemas.customer import CustomerResponse
from app.schemas.product import ProductResponse

class OrderItemCreate(BaseModel):
    product_id: UUID = Field(..., description="ID of the product being ordered")
    quantity: int = Field(..., gt=0, description="Quantity of the product. Must be strictly greater than 0.")

class OrderCreate(BaseModel):
    customer_id: UUID = Field(..., description="ID of the customer placing the order")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="List of items to order. Must contain at least one item.")

class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    unit_price: float
    product: ProductResponse  # Nested product details
    
    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: UUID
    customer_id: UUID
    total_amount: float
    created_at: datetime
    updated_at: datetime
    customer: CustomerResponse  # Nested customer details
    items: List[OrderItemResponse]  # Nested items
    
    model_config = ConfigDict(from_attributes=True)

class OrderListResponse(BaseModel):
    data: List[OrderResponse]
    total: int
    limit: int
    offset: int
