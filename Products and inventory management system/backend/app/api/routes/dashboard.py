from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import DashboardService

router = APIRouter()

async def get_dashboard_service(db: AsyncSession = Depends(get_db)) -> DashboardService:
    return DashboardService(db)

@router.get("/summary", response_model=DashboardSummaryResponse, summary="Get Dashboard Summary")
async def get_dashboard_summary(
    service: DashboardService = Depends(get_dashboard_service)
):
    """
    Returns aggregated metrics for the dashboard including total counts, 
    inventory value, and low stock alerts.
    """
    return await service.get_summary()
