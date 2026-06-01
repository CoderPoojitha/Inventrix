import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
from app.services.product_service import ProductService

# Create the router
router = APIRouter()

# Dependency provider for the service
async def get_product_service(db: AsyncSession = Depends(get_db)) -> ProductService:
    return ProductService(db)

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, summary="Create a new Product")
async def create_product(
    product_in: ProductCreate,
    service: ProductService = Depends(get_product_service)
):
    """
    Creates a new product in the inventory.
    """
    return await service.create_product(product_in)

@router.get("/", response_model=ProductListResponse, summary="Get paginated list of Products")
async def get_products(
    limit: int = Query(10, ge=1, le=100, description="Number of records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    search: Optional[str] = Query(None, description="Search by product name or SKU"),
    service: ProductService = Depends(get_product_service)
):
    """
    Returns a paginated list of products.
    Optionally filter by name or SKU using the 'search' query parameter.
    """
    products, total = await service.get_products(limit=limit, offset=offset, search=search)
    return ProductListResponse(
        data=products,
        total=total,
        limit=limit,
        offset=offset
    )

@router.get("/{product_id}", response_model=ProductResponse, summary="Get a Product by ID")
async def get_product(
    product_id: uuid.UUID,
    service: ProductService = Depends(get_product_service)
):
    """
    Retrieves a specific product by its UUID.
    """
    return await service.get_product_by_id(product_id)

@router.put("/{product_id}", response_model=ProductResponse, summary="Update a Product")
async def update_product(
    product_id: uuid.UUID,
    product_in: ProductUpdate,
    service: ProductService = Depends(get_product_service)
):
    """
    Updates an existing product. Only fields provided in the request body will be updated.
    """
    return await service.update_product(product_id, product_in)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a Product")
async def delete_product(
    product_id: uuid.UUID,
    service: ProductService = Depends(get_product_service)
):
    """
    Deletes a product by its UUID.
    """
    await service.delete_product(product_id)
