import uuid
from sqlalchemy import ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import BaseModel

class Order(BaseModel):
    """
    Database model for Order entities.
    """
    __tablename__ = "orders"

    customer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False, index=True)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)

    # Relationships
    customer = relationship("Customer", lazy="noload") # We will eager load this when needed
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan", lazy="noload")
