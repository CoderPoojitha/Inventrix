from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel

class Customer(BaseModel):
    """
    Database model for Customer entities.
    Inherits id, created_at, updated_at from BaseModel.
    """
    __tablename__ = "customers"

    full_name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)
    phone_number: Mapped[str | None] = mapped_column(String, nullable=True)
