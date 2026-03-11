import uuid
from loguru import logger

from app.dashboard.models import DashboardIndex

async def get_dashboard_for_user(user_id: uuid.UUID) -> DashboardIndex:
    logger.warning(f"[get_dashboard_for_user]: Not implemented")
    raise NotImplementedError("Dashboard service not implemented")