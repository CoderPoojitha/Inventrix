import uuid
from typing import Tuple, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from fastapi import HTTPException, status

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate

class ProductService:
    """
    Service layer containing all business logic for Product operations.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_products(self, limit: int, offset: int, search: Optional[str] = None) -> Tuple[List[Product], int]:
        """Fetch paginated products, optionally filtered by a search term."""
        query = select(Product)
        
        # Apply search filter if provided
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    Product.name.ilike(search_term),
                    Product.sku.ilike(search_term)
                )
            )

        # Get total count (for pagination)
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query)

        # Get paginated data
        query = query.limit(limit).offset(offset).order_by(Product.created_at.desc())
        result = await self.db.execute(query)
        products = result.scalars().all()

        return list(products), total or 0

    async def get_product_by_id(self, product_id: uuid.UUID) -> Product:
        """Fetch a single product by its UUID. Raises 404 if not found."""
        product = await self.db.get(Product, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {product_id} not found."
            )
        return product

    async def get_product_by_sku(self, sku: str) -> Optional[Product]:
        """Fetch a product by SKU."""
        query = select(Product).where(Product.sku == sku)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_product(self, product_in: ProductCreate) -> Product:
        """Create a new product, ensuring the SKU is unique."""
        # Enforce business rule: SKU must be unique
        existing_product = await self.get_product_by_sku(product_in.sku)
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{product_in.sku}' already exists."
            )

        # Create model instance
        product = Product(**product_in.model_dump())
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def update_product(self, product_id: uuid.UUID, product_in: ProductUpdate) -> Product:
        """Update an existing product, verifying SKU uniqueness if it's changing."""
        product = await self.get_product_by_id(product_id)

        update_data = product_in.model_dump(exclude_unset=True)

        if "sku" in update_data and update_data["sku"] != product.sku:
            existing_product = await self.get_product_by_sku(update_data["sku"])
            if existing_product:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product with SKU '{update_data['sku']}' already exists."
                )

        for field, value in update_data.items():
            setattr(product, field, value)

        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def delete_product(self, product_id: uuid.UUID) -> None:
        """Delete a product by ID."""
        product = await self.get_product_by_id(product_id)
        await self.db.delete(product)
        await self.db.commit()
