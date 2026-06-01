from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.admin import Admin
from app.schemas.auth import AdminCreate
from app.core.security import get_password_hash, verify_password
from app.core.exceptions import DuplicateResourceException

class AuthService:
    """
    Service layer handling admin creation and authentication.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_admin_by_email(self, email: str) -> Admin | None:
        query = select(Admin).where(Admin.email == email)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_admin(self, admin_in: AdminCreate) -> Admin:
        """Creates a new admin, throwing a 409 if the email exists."""
        existing = await self.get_admin_by_email(admin_in.email)
        if existing:
            raise DuplicateResourceException(f"Admin with email '{admin_in.email}' already exists.")
        
        hashed_pw = get_password_hash(admin_in.password)
        admin = Admin(email=admin_in.email, hashed_password=hashed_pw)
        self.db.add(admin)
        await self.db.commit()
        await self.db.refresh(admin)
        return admin

    async def authenticate_admin(self, email: str, password: str) -> Admin | None:
        """Verifies an email and password against the database."""
        admin = await self.get_admin_by_email(email)
        if not admin:
            return None
        if not verify_password(password, admin.hashed_password):
            return None
        return admin
