import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerListResponse
from app.services.customer_service import CustomerService

# Create the router
router = APIRouter()

# Dependency provider for the service
async def get_customer_service(db: AsyncSession = Depends(get_db)) -> CustomerService:
    return CustomerService(db)

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED, summary="Create a new Customer")
async def create_customer(
    customer_in: CustomerCreate,
    service: CustomerService = Depends(get_customer_service)
):
    """
    Creates a new customer.
    """
    return await service.create_customer(customer_in)

@router.get("/", response_model=CustomerListResponse, summary="Get paginated list of Customers")
async def get_customers(
    limit: int = Query(10, ge=1, le=100, description="Number of records to return"),
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    search: Optional[str] = Query(None, description="Search by customer name or email"),
    service: CustomerService = Depends(get_customer_service)
):
    """
    Returns a paginated list of customers.
    Optionally filter by name or email using the 'search' query parameter.
    """
    customers, total = await service.get_customers(limit=limit, offset=offset, search=search)
    return CustomerListResponse(
        data=customers,
        total=total,
        limit=limit,
        offset=offset
    )

@router.get("/{customer_id}", response_model=CustomerResponse, summary="Get a Customer by ID")
async def get_customer(
    customer_id: uuid.UUID,
    service: CustomerService = Depends(get_customer_service)
):
    """
    Retrieves a specific customer by its UUID.
    """
    return await service.get_customer_by_id(customer_id)

@router.put("/{customer_id}", response_model=CustomerResponse, summary="Update a Customer")
async def update_customer(
    customer_id: uuid.UUID,
    customer_in: CustomerUpdate,
    service: CustomerService = Depends(get_customer_service)
):
    """
    Updates an existing customer. Only fields provided in the request body will be updated.
    """
    return await service.update_customer(customer_id, customer_in)

@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a Customer")
async def delete_customer(
    customer_id: uuid.UUID,
    service: CustomerService = Depends(get_customer_service)
):
    """
    Deletes a customer by its UUID.
    """
    await service.delete_customer(customer_id)
