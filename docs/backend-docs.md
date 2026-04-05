# Backend Documentation

> Last updated: 2026-04-05

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

1. **Frontend** redirects the user to `GET /api/v1/google/login`.
2. The backend builds a Google OAuth authorization URL with a signed **state token** (contains `provider`, `flow_type`, short expiry) and redirects the browser to Google.
3. After the user consents, Google redirects to `GET /api/v1/oauth/callback?code=...&state=...`.
4. The callback endpoint:
   - Validates the state token.
   - Exchanges the authorization code for a Google access token.
   - Fetches user info (email, name, avatar) from Google.
   - Finds or creates the internal User + Provider + ProvidedUser records.
   - Issues **access** and **refresh** tokens as httponly cookies.
   - Redirects the browser to the frontend's callback page.
5. The frontend validates the session via `POST /api/v1/oauth/validate`.

### JWT Structure

Tokens carry the following payload:

```json
{
  "user_id": "uuid-string",
  "email": "user@example.com",
  "auth_method": "google",
  "token_type": "access_token",
  "iat": 1712345678,
  "exp": 1712349278,
  "iss": "https://github.io.spyro1/daily"
}
```

- **`user_id`** is the primary principal (internal UUID), not the Google `sub`.
- Access tokens expire in the configured minutes; refresh tokens in days.
- Cookies use `secure=true` in production, `samesite=lax`, `httponly=true`.

### Key Endpoints

| Method | Path                    | Auth     | Description                       |
|--------|-------------------------|----------|-----------------------------------|
| GET    | /api/v1/google/login    | Public   | Initiates Google OAuth redirect   |
| GET    | /api/v1/oauth/callback  | Public   | OAuth callback (code exchange)    |
| POST   | /api/v1/oauth/validate  | Cookie   | Validates access token            |
| POST   | /api/v1/oauth/refresh   | Cookie   | Exchanges refresh for new access  |
| POST   | /api/v1/oauth/logout    | Public   | Clears auth cookies               |
| GET    | /api/v1/oauth/token     | Cookie   | Returns access token as string    |

### Dependencies

- **`get_current_user`**: FastAPI dependency that reads the `access_token` cookie, decodes it, looks up the user by `user_id`, and returns the `Users` ORM instance. Used by all protected endpoints.
- **`get_optional_current_user`**: Same but returns `None` instead of raising 401. Available for future use.

---

## Sync Push

The **sync push** endpoint enables the frontend to upload locally-stored data (from IndexedDB) to the backend after the user signs in with Google.

### Endpoint

`POST /api/v1/sync/push` — requires authentication.

### Request Body

```json
{
  "accounts": [
    { "id": "uuid", "name": "Wallet", "currency_code": "EUR", "icon_name": "Savings", "color": "#FF5733", "include_in_total": true, "is_archived": false }
  ],
  "categories": [
    { "id": "uuid", "parent_id": null, "name": "Food", "category_type": "expense", "icon_name": "Savings", "color": "#33FF57" }
  ],
  "transactions": [
    { "id": "uuid", "source_account_id": "uuid", "category_id": "uuid", "transaction_type": "expense", "amount": 100.00, "occurred_at": "2026-04-01T12:00:00Z", "note": "Lunch" }
  ]
}
```

### Behavior

- Insertion order: accounts → categories (parents first) → transactions (FK dependencies).
- **Idempotent**: rows whose `id` already exists under this user are silently skipped.
- All rows are assigned the authenticated user's `user_id`.
- Returns counts of created rows.

### Response

```json
{
  "accounts_created": 2,
  "categories_created": 5,
  "transactions_created": 12,
  "message": "Sync push completed"
}
```

---

## API Routes Summary

All routes are prefixed with `/api/v1/`.

| Prefix          | Module                      | Auth Required | Description                   |
|-----------------|-----------------------------|---------------|-------------------------------|
| /google         | google_router               | No            | Google OAuth login redirect   |
| /oauth          | oauth_router                | Mixed         | Token management & callback   |
| /sync           | sync_router                 | Yes           | One-time local data push      |
| /dashboard      | dashboard_router            | Yes           | Dashboard summary             |
| /accounts       | accounts_router             | Yes           | Account CRUD                  |
| /categories     | categories_router           | Yes           | Category CRUD                 |
| /transactions   | transactions_router         | Yes           | Transaction CRUD              |

---

## Configuration

All configuration is loaded via **pydantic-settings** from environment variables (with `.env` file support).

| Prefix        | Class        | Key Variables                                          |
|---------------|--------------|--------------------------------------------------------|
| (none)        | AppConfig    | `LOG_LEVEL`, `ENVIRONMENT` (development/production)    |
| `DB_`         | Database     | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` |
| `JWT_`        | JWT          | `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`, `JWT_REFRESH_TOKEN_EXPIRE_DAYS`, `JWT_LOGIN_TOKEN_EXPIRE_MINUTES` |
| `GOOGLE_`     | Google       | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GOOGLE_TOKEN_URL`, `GOOGLE_USERINFO_URL` |
| `FRONTEND_`   | Frontend     | `FRONTEND_AUTH_CALLBACK`, `FRONTEND_CORS_ORIGINS`      |

---

## Testing

Tests use **pytest** with a dedicated test database that is created and destroyed per session.

```bash
cd backend
pytest
```

### Test Infrastructure

- `conftest.py` creates a test PostgreSQL database, applies all migrations via `Base.metadata.create_all`, and provides:
  - `test_user` fixture — a pre-seeded user record.
  - `client` fixture — a `TestClient` with overridden `get_db` and `get_current_user` dependencies.
  - `seed_account`, `seed_category`, `seed_transaction` fixtures for domain data.

### Test Files

| File                        | Covers                                 |
|-----------------------------|----------------------------------------|
| test_main.py                | Health check, root endpoint            |
| test_oauth_router.py        | Logout, validate, refresh, callback    |
| test_local_auth.py          | JWT user_id auth, token validation     |
| test_accounts_router.py     | Account CRUD endpoints                 |
| test_categories_router.py   | Category CRUD endpoints                |
| test_transactions_router.py | Transaction CRUD endpoints             |
| test_dashboard_router.py    | Dashboard summary endpoint             |
| test_sync_push.py           | Sync push endpoint (idempotency, etc.) |

---

## Running

```bash
cd backend
pip install -r requirements.txt

# Set up .env with DB, JWT, Google, Frontend vars
uvicorn app.main:app --reload --port 8000
```

Alembic migrations run automatically on startup. The app will attempt to create the database if it doesn't exist.
