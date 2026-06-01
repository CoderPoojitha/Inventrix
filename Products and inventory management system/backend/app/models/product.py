from sqlalchemy import String, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel

class Product(BaseModel):
    """
    Database model for Product entities.
    Inherits id, created_at, updated_at from BaseModel.
    """
    __tablename__ = "products"

    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    sku: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    quantity_in_stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
