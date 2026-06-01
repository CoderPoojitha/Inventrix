import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool

# Define the isolated test database connection
TEST_DATABASE_URL = "postgresql+asyncpg://postgres:postgres123@localhost:5432/test_inventory_db"

# Create engine globally but with NullPool so it doesn't hold connections across loops
engine = create_async_engine(TEST_DATABASE_URL, echo=False, poolclass=NullPool)
TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession, expire_on_commit=False)

# Import the Base and the app
from app.models.base import Base
from app.main import app
from app.db.database import get_db

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    """Create test database tables before tests run, and drop them after. Function-scoped for total isolation."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def db_session() -> AsyncSession:
    """Fixture to provide a clean database session for each test."""
    async with TestingSessionLocal() as session:
        yield session

@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncClient:
    """
    Fixture to provide an AsyncClient for hitting the API.
    Overrides the FastAPI 'get_db' dependency to use the test database session.
    """
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

    # Clear overrides after the test
    app.dependency_overrides.clear()
