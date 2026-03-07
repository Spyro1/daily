from fastapi import APIRouter

import app.auth.oauth_router as oauth
import app.auth.google.google_router as google
import app.dashboard.dashboard_router as dashboard

router = APIRouter()

# Auth routes
router.include_router(
    oauth.router,
    prefix='/api/v1/oauth',
    tags=['v1', 'oauth'])

router.include_router(
    google.router,
    prefix='/api/v1/google',
    tags=['v1', 'oauth']
)


# Data routes
router.include_router(
    dashboard.router,
    prefix='/api/v1',
    tags=['v1', 'dashboard'])

