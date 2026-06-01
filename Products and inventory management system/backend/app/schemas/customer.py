from typing import Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, EmailStr, ConfigDict

class CustomerBase(BaseModel):
    """Base fields shared across multiple customer schemas."""
    full_name: str = Field(..., description="Full name of the customer")
    email: EmailStr = Field(..., description="Email address of the customer")
    phone_number: Optional[str] = Field(None, description="Optional phone number")

class CustomerCreate(CustomerBase):
    """Schema for creating a new customer."""
    pass

class CustomerUpdate(BaseModel):
    """Schema for updating an existing customer (partial updates allowed)."""
    full_name: Optional[str] = Field(None, description="Full name of the customer")
    email: Optional[EmailStr] = Field(None, description="Email address of the customer")
    phone_number: Optional[str] = Field(None, description="Optional phone number")

class CustomerResponse(CustomerBase):
    """Schema representing a customer as returned by the API."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class CustomerListResponse(BaseModel):
    """Schema for paginated list of customers."""
    data: List[CustomerResponse]
    total: int
    limit: int
    offset: int
