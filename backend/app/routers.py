"""Central route registry — all API v1 routers are mounted here."""

from fastapi import APIRouter

import app.accounts.accounts_router as accounts
import app.auth.google.google_router as google
import app.auth.oauth_router as oauth
import app.categories.categories_router as categories
import app.dashboard.dashboard_router as dashboard
import app.sync.sync_router as sync
import app.transactions.transactions_router as transactions

router = APIRouter()

# ─── Auth ────────────────────────────────────────────────────────────

router.include_router(google.router, prefix="/api/v1/google", tags=["oauth"])
router.include_router(oauth.router, prefix="/api/v1/oauth", tags=["oauth"])
router.include_router(sync.router, prefix="/api/v1/sync", tags=["sync"])

# ─── Data ────────────────────────────────────────────────────────────

router.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
router.include_router(accounts.router, prefix="/api/v1/accounts", tags=["accounts"])
router.include_router(categories.router, prefix="/api/v1/categories", tags=["categories"])
router.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])

