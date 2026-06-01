from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class AdminCreate(BaseModel):
    """Schema for creating a new admin."""
    email: EmailStr
    password: str

class AdminResponse(BaseModel):
    """Schema for returning admin profile data safely (no password)."""
    id: UUID
    email: EmailStr
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    """Schema for the standard OAuth2 JWT response."""
    access_token: str
    token_type: str
