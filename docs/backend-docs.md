# Backend Documentation

Last updated: 2026-05-04

## Overview

The backend is a **FastAPI** application that provides a REST API for the Daily personal finance tracker. It uses **PostgreSQL** as its database, **SQLAlchemy** (async) as the ORM, **Alembic** for migrations, and **PyJWT** for authentication via httponly cookies.

Users authenticate exclusively through **Google OAuth 2.0**. There is no password-based registration. A one-time **sync push** endpoint allows the frontend to upload locally-stored data after the user signs in with Google for the first time.

---

## Tech Stack

| Component        | Technology                        |
|------------------|-----------------------------------|
| Framework        | FastAPI 0.135                     |
| Language         | Python 3.x                       |
| Database         | PostgreSQL (asyncpg driver)       |
| ORM              | SQLAlchemy 2.0 (async)            |
| Migrations       | Alembic                           |
| Auth             | Google OAuth 2.0 + PyJWT          |
| HTTP Client      | httpx (for OAuth token exchange)  |
| Validation       | Pydantic v2 + pydantic-settings   |
| Logging          | Loguru                            |
| Testing          | pytest + FastAPI TestClient       |

---

## Project Structure

```
backend/
├── alembic.ini              # Alembic configuration
├── conftest.py              # Shared pytest fixtures (test DB, test user, TestClient)
├── requirements.txt         # Python dependencies
├── Dockerfile
│
├── app/
│   ├── main.py              # FastAPI app creation, lifespan, middleware
│   ├── routers.py           # Central router aggregation (all prefixes registered here)
│   │
│   ├── auth/
│   │   ├── schema.py        # TokenData, TokenType, FlowType, AuthMethod, ResponseMessage
│   │   ├── jwt_utils.py     # Token creation/decoding, get_current_user dependency
│   │   ├── oauth_router.py  # /oauth/* endpoints (logout, validate, refresh, token, callback)
│   │   ├── google/
│   │   │   └── google_router.py  # /google/login — initiates Google OAuth redirect
│   │   ├── test_oauth_router.py
│   │   └── test_local_auth.py
│   │
│   ├── sync/
│   │   ├── schemas.py       # SyncPushRequest/Response, SyncAccount/Category/Transaction
│   │   ├── service.py       # push_local_data() — idempotent bulk insert
│   │   ├── sync_router.py   # POST /sync/push
│   │   └── test_sync_push.py
│   │
│   ├── accounts/
│   │   ├── schemas.py       # CreateAccount, UpdateAccount, AccountIndex, AccountBrief
│   │   ├── service.py       # CRUD operations for accounts
│   │   ├── accounts_router.py
│   │   └── test_accounts_router.py
│   │
│   ├── categories/
│   │   ├── schemas.py       # CreateCategory, UpdateCategory, CategoryIndex
│   │   ├── service.py
│   │   ├── categories_router.py
│   │   └── test_categories_router.py
│   │
│   ├── transactions/
│   │   ├── schemas.py       # CreateTransaction, UpdateTransaction, TransactionIndex
│   │   ├── service.py
│   │   ├── transactions_router.py
│   │   └── test_transactions_router.py
│   │
│   ├── dashboard/
│   │   ├── schemas.py       # DashboardIndex (accounts + recent transactions)
│   │   ├── service.py
│   │   ├── dashboard_router.py
│   │   └── test_dashboard_router.py
│   │
│   ├── users/
│   │   ├── schemas.py       # UserCreate, ProviderCreate, ProvidedUserCreate
│   │   ├── service.py       # User/Provider/ProvidedUser CRUD
│   │   └── users_router.py
│   │
│   ├── icons/               # (Disabled — placeholder for icon management)
│   │   ├── schemas.py
│   │   ├── service.py
│   │   └── icons_router.py
│   │
│   └── core/
│       ├── config.py        # pydantic-settings: AppConfig, Database, JWT, Google, Frontend
│       └── logging.py       # Loguru configuration
│
└── db/
    ├── core.py              # Async engine, session factory, get_db dependency
    ├── models.py            # SQLAlchemy ORM models
    ├── migrations/          # Alembic migration scripts
    └── seed/
        └── default_seed.py  # Default data seeding
```

---

## Database Models

All models inherit from a `Base` class that provides `created_at`, `updated_at`, and `deleted_at` (soft-delete) timestamps.

### Users
The central identity table. Every user has a UUID primary key, optional email, display name, and avatar URL. A user is created when they first sign in via Google.

| Column       | Type         | Notes                                |
|--------------|--------------|--------------------------------------|
| id           | UUID (PK)    | Auto-generated                       |
| email        | String(255)  | Nullable, unique among active users  |
| display_name | String(255)  | Required, non-empty                  |
| avatar_url   | Text         | Nullable                             |

### Providers
Lookup table of SSO providers (currently only "google").

| Column     | Type         | Notes                              |
|------------|--------------|------------------------------------|
| id         | UUID (PK)    |                                    |
| name       | String(255)  | Unique among active records        |
| is_enabled | Boolean      | Default `true`                     |

### ProvidedUsers
Junction table linking a User to a Provider via the provider's user ID (`sub` claim).

| Column           | Type         | Notes                                            |
|------------------|--------------|--------------------------------------------------|
| id               | UUID (PK)    |                                                  |
| user_id          | UUID (FK)    | → users.id, CASCADE delete                       |
| provider_id      | UUID (FK)    | → providers.id, RESTRICT delete                  |
| provider_user_id | String(255)  | The `sub` from Google; unique per provider       |

### Accounts
User financial accounts (e.g. "Wallet", "Bank account").

| Column           | Type           | Notes                                   |
|------------------|----------------|-----------------------------------------|
| id               | UUID (PK)      |                                         |
| user_id          | UUID (FK)      | → users.id                              |
| name             | String(255)    | Unique per user (among active records)  |
| currency_code    | String(3)      | ISO 4217, e.g. "EUR"                    |
| icon_name        | String(100)    | Default "Savings"                       |
| color            | String(7)      | Hex like "#FF5733", nullable            |
| include_in_total | Boolean        | Default `true`                          |
| is_archived      | Boolean        | Default `false`                         |
| balance          | Decimal (calc) | Computed column property from transactions |

### Categories
Expense or income categories, supporting a single parent-child level.

| Column             | Type         | Notes                                           |
|--------------------|--------------|-------------------------------------------------|
| id                 | UUID (PK)    |                                                 |
| user_id            | UUID (FK)    | → users.id                                     |
| parent_id          | UUID (FK)    | → categories.id, nullable (top-level if null)   |
| name               | String(255)  | Unique per user+parent+type                     |
| category_type      | String(20)   | "expense" or "income"                           |
| is_system_category | Boolean      | Default `false`                                 |
| icon_name          | String(100)  |                                                 |
| color              | String(7)    | Nullable hex                                    |

### Transactions
Every financial event. Type determines which accounts and category are required:
- **expense**: source_account required, category required
- **income**: destination_account required, category required
- **transfer**: both accounts required, no category, target_amount required

| Column                 | Type           | Notes                                |
|------------------------|----------------|--------------------------------------|
| id                     | UUID (PK)      |                                      |
| user_id                | UUID (FK)      | → users.id                          |
| source_account_id      | UUID (FK)      | Nullable                             |
| destination_account_id | UUID (FK)      | Nullable                             |
| category_id            | UUID (FK)      | Nullable                             |
| transaction_type       | String(20)     | "income", "expense", "transfer"     |
| amount                 | Numeric(18,4)  | Must be > 0                         |
| target_amount          | Numeric(18,4)  | For cross-currency transfers        |
| occurred_at            | DateTime (tz)  |                                      |
| note                   | Text           | Nullable                             |

Database-level check constraints enforce the type-to-fields rules (see `ck_transactions_type_integrity`).

---

## Authentication

### Flow

1. **Frontend** redirects the user to `GET /api/v1/google/login`
- OAuth callback: `GET /api/v1/oauth/callback`
- Access token validation: `POST /api/v1/oauth/validate`
- Access token refresh: `POST /api/v1/oauth/refresh`
- Logout: `POST /api/v1/oauth/logout`
- Token as string: `GET /api/v1/oauth/token`

Session principal is `user_id` from JWT payload.

## API Surface

- Dashboard: `GET /api/v1/dashboard`
- Accounts: list/get/create/update/delete under `/api/v1/accounts`
- Categories: list/tree/get/create/update/delete under `/api/v1/categories`
- Transactions: list/get/create/update/delete under `/api/v1/transactions`
- Sync push: `POST /api/v1/sync/push`

## Data Integrity Highlights

- Soft delete (`deleted_at`) on core entities
- Check constraints for transaction type integrity
- Currency format and color format checks
- Partial unique indexes for active records
- Computed account balance from transactions (`column_property`)

## Tests

Main test modules:
- `app/test_main.py`
- `app/auth/google/test_google_router.py`
- `app/accounts/test_accounts_router.py`
- `app/categories/test_categories_router.py`
- `app/transactions/test_transactions_router.py`
- `app/dashboard/test_dashboard_router.py`
- `app/sync/test_sync_push.py`

## Known Gaps

- Account opening-balance transaction automation is still TODO
- Dedicated balance-adjustment transaction flow is still TODO
