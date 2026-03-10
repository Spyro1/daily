from fastapi import APIRouter

import app.auth.oauth_router as oauth
import app.auth.google.google_router as google
import app.dashboard.dashboard_router as dashboard
import app.transactions.transactions_router as transactions
import app.accounts.accounts_router as accounts
import app.icons.icons_router as icons
import app.categories.categories_router as categories

router = APIRouter()

# Auth routes
router.include_router(
    google.router,
    prefix='/api/v1/google',
    tags=['v1', 'oauth']
)
router.include_router(
    oauth.router,
    prefix='/api/v1/oauth',
    tags=['v1', 'oauth'])



# Data routes
router.include_router(
    dashboard.router,
    prefix='/api/v1/dashboard',
    tags=['v1', 'dashboard'])

router.include_router(
    accounts.router,
    prefix='/api/v1/accounts',
    tags=['v1', 'accounts'])

router.include_router(
    categories.router,
    prefix='/api/v1/categories',
    tags=['v1', 'categories'])

router.include_router(
    icons.router,
    prefix='/api/v1/icons',
    tags=['v1', 'icons'])

router.include_router(
    transactions.router,
    prefix='/api/v1/transactions',
    tags=['v1', 'transactions'])
