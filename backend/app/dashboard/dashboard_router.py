from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.jwt_utils import get_current_user
from db.models import Users
from db.core import get_db

from app.dashboard.schemas import DashboardIndex
from app.accounts.service import get_accounts_for_user
from app.dashboard.service import get_dashboard_for_user


router = APIRouter()

# ================================
# Helper functions
# ================================

def _log_context(current_user: Users, action: str) -> str:
    return f"[{current_user.display_name}][dashboard/{action}]"


# ================================
# Endpoints
# ================================

@router.get('')
async def get_my_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: Users = Depends(get_current_user),
) -> DashboardIndex: 
    log_context = _log_context(current_user, "get_my_dashboard")
    logger.info(f"{log_context}: Fetching dashboard data")

    try:
        dashboard = await get_dashboard_for_user(db, current_user.id)
    except NotImplementedError as ne:
        logger.warning(f"{log_context}: Dashboard service not implemented: {ne}")
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Dashboard endpoint not implemented")
    except Exception as e:
        logger.exception(f"{log_context}: Error fetching dashboard accounts: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error fetching dashboard data")

    logger.info(f"{log_context}: Returning dashboard with {len(dashboard.accounts)} accounts and {len(dashboard.transactions)} transactions")
    return dashboard