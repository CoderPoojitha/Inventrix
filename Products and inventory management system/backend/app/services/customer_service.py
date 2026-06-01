import uuid
from typing import Tuple, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from fastapi import HTTPException, status

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate

class CustomerService:
    """
    Service layer containing all business logic for Customer operations.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_customers(self, limit: int, offset: int, search: Optional[str] = None) -> Tuple[List[Customer], int]:
        """Fetch paginated customers, optionally filtered by a search term."""
        query = select(Customer)
        
        # Apply search filter if provided
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    Customer.full_name.ilike(search_term),
                    Customer.email.ilike(search_term)
                )
            )

        # Get total count (for pagination)
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query)

        # Get paginated data
        query = query.limit(limit).offset(offset).order_by(Customer.created_at.desc())
        result = await self.db.execute(query)
        customers = result.scalars().all()

        return list(customers), total or 0

    async def get_customer_by_id(self, customer_id: uuid.UUID) -> Customer:
        """Fetch a single customer by its UUID. Raises 404 if not found."""
        customer = await self.db.get(Customer, customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with id {customer_id} not found."
            )
        return customer

    async def get_customer_by_email(self, email: str) -> Optional[Customer]:
        """Fetch a customer by email."""
        query = select(Customer).where(Customer.email == email)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_customer(self, customer_in: CustomerCreate) -> Customer:
        """Create a new customer, ensuring the email is unique."""
        existing_customer = await self.get_customer_by_email(customer_in.email)
        if existing_customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer with email '{customer_in.email}' already exists."
            )

        customer = Customer(**customer_in.model_dump())
        self.db.add(customer)
        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def update_customer(self, customer_id: uuid.UUID, customer_in: CustomerUpdate) -> Customer:
        """Update an existing customer, verifying email uniqueness if it's changing."""
        customer = await self.get_customer_by_id(customer_id)

        update_data = customer_in.model_dump(exclude_unset=True)

        if "email" in update_data and update_data["email"] != customer.email:
            existing_customer = await self.get_customer_by_email(update_data["email"])
            if existing_customer:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Customer with email '{update_data['email']}' already exists."
                )

        for field, value in update_data.items():
            setattr(customer, field, value)

        await self.db.commit()
        await self.db.refresh(customer)
        return customer

    async def delete_customer(self, customer_id: uuid.UUID) -> None:
        """Delete a customer by ID."""
        customer = await self.get_customer_by_id(customer_id)
        await self.db.delete(customer)
        await self.db.commit()
