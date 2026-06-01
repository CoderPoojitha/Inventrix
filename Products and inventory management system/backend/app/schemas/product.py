from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

class ProductBase(BaseModel):
    """Base fields shared across multiple product schemas."""
    name: str = Field(..., description="Name of the product")
    sku: str = Field(..., description="Stock Keeping Unit identifier")
    price: float = Field(..., ge=0.0, description="Price of the product. Cannot be negative.")
    quantity_in_stock: int = Field(default=0, ge=0, description="Available quantity in stock. Cannot be negative.")

class ProductCreate(ProductBase):
    """Schema for creating a new product."""
    pass

class ProductUpdate(BaseModel):
    """Schema for updating an existing product (partial updates allowed)."""
    name: Optional[str] = Field(None, description="Name of the product")
    sku: Optional[str] = Field(None, description="Stock Keeping Unit identifier")
    price: Optional[float] = Field(None, ge=0.0, description="Price of the product. Cannot be negative.")
    quantity_in_stock: Optional[int] = Field(None, ge=0, description="Available quantity in stock. Cannot be negative.")

class ProductResponse(ProductBase):
    """Schema representing a product as returned by the API."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    # Allows Pydantic to read data from SQLAlchemy ORM objects directly
    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    """Schema for paginated list of products."""
    data: List[ProductResponse]
    total: int
    limit: int
    offset: int
