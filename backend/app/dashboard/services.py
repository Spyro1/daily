import uuid
from datetime import datetime, timezone
from loguru import logger
from fastapi import HTTPException, status

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload

from app.dashboard.models import DashboardIndex
from app.accounts.services import fill_account_brief, get_accounts_for_user
from app.transactions.services import fill_transaction_brief, get_transactions_for_user

async def get_dashboard_for_user(db: AsyncSession, user_id: uuid.UUID) -> DashboardIndex:
    logger.debug(f"[get_dashboard_for_user]: Fetching dashboard data for user {user_id}")

    try:
        db_accounts = await get_accounts_for_user(db, user_id)
    except Exception as exc:
        logger.exception(f"[get_dashboard_for_user]: Failed to fetch accounts for user {user_id}: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch dashboard data") 

    try:
        db_transactions = await get_transactions_for_user(db, user_id)
    except Exception as exc:
        logger.exception(f"[get_dashboard_for_user]: Failed to fetch transactions for user {user_id}: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch dashboard data")

    accounts = [fill_account_brief(account) for account in db_accounts]
    transactions = [fill_transaction_brief(transaction) for transaction in db_transactions]

    dashboard = DashboardIndex(
        accounts=accounts,
        transactions=transactions,
    )
    
    logger.debug(f"[get_dashboard_for_user]: Fetched {len(accounts)} accounts and {len(transactions)} transactions for user {user_id}")
    return dashboard
    