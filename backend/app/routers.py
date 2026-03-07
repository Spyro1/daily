from fastapi import APIRouter

import dashboard.dashboard_router as dashboard

router = APIRouter()

router.include_router(
    dashboard.router,
    prefix='/api/v1',
    tags=['index', 'v1'])

