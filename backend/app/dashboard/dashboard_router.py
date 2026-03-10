import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.jwt_utils import get_current_user
from db.models import Users
from db.core import get_db
from app.dashboard.models import DashboardIndex
router = APIRouter()

@router.get('')
async def get_my_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user),
) -> DashboardIndex: 
    # TODO: Implement this
    return DashboardIndex(accounts=[])