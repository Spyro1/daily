# Frontend Documentation

> Last updated: 2026-04-05

## Overview

The frontend is a **React** single-page application built with **Vite**, **TypeScript**, and **Material UI**. It is designed as a mobile-first personal finance tracker (max 480px viewport) that supports two operating modes:

1. **Local mode** — data is stored entirely in the browser's IndexedDB via Dexie.js. No server connection is needed.
2. **Online mode** — the user authenticates via Google OAuth and all data is managed by the backend REST API.

When a local user links their Google account, all local data is automatically pushed to the backend and the local database is cleared.

---

## Tech Stack

| Component       | Technology                                     |
|-----------------|-------------------------------------------------|
| Framework       | React 19                                        |
| Build Tool      | Vite 7                                          |
| Language        | TypeScript 5 (strict mode)                      |
| UI Library      | Material UI 7 (MUI)                             |
| Routing         | TanStack Router (file-based)                    |
| Data Fetching   | TanStack React Query                            |
| HTTP Client     | Axios                                           |
| Local Storage   | Dexie.js (IndexedDB wrapper)                    |
| API Codegen     | OpenAPI Generator (typescript-axios)             |
| Styling         | Tailwind CSS 4 + MUI theme                      |
| Charts          | Recharts                                        |

---

## Project Structure

```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
│
├── public/
│   ├── env.js              # Runtime environment overrides
│   ├── manifest.json
│   └── brand/              # App logos
│
└── src/
    ├── main.tsx             # React root, QueryClientProvider + RouterProvider
    ├── router.tsx           # TanStack Router creation
    ├── constants.ts         # API_BASE, APP_NAME
    ├── routeTree.gen.ts     # Auto-generated route tree
    │
    ├── api/
    │   ├── clients.ts       # Axios instances + generated API clients
    │   ├── authClient.ts    # Interceptor-free Axios for auth calls (avoids refresh loops)
    │   ├── queryClient.ts   # TanStack Query client configuration
    │   ├── queryKeys.ts     # Centralized query key definitions
    │   ├── responseHandler.ts  # Axios interceptor: 401 refresh, error toasts
    │   ├── notificationService.ts  # Module-level toast bridge (imperative → React)
    │   └── generated/       # OpenAPI-generated API classes and types
    │
    ├── lib/
    │   ├── localDb.ts       # Dexie.js IndexedDB schema (accounts, categories, transactions, profile)
    │   ├── localCrud.ts     # Full CRUD for local IndexedDB tables
    │   └── syncPush.ts      # Pushes local data to POST /api/v1/sync/push
    │
    ├── features/
    │   ├── auth/
    │   │   ├── components/
    │   │   │   └── AuthGuard.tsx      # Route protection (public / local / online)
    │   │   └── hooks/
    │   │       ├── useAuthVerification.ts  # Server-side token validation
    │   │       └── useLocalAuth.tsx        # LocalAuthProvider context + useLocalAuth hook
    │   │
    │   ├── accounts/
    │   │   ├── AccountsPage.tsx
    │   │   ├── CreateAccountPage.tsx
    │   │   ├── components/            # AccountCard, etc.
    │   │   └── hooks/
    │   │       └── useAccounts.ts     # Dual-mode: IndexedDB or API
    │   │
    │   ├── categories/
    │   │   ├── CategoriesPage.tsx
    │   │   ├── CreateCategoryPage.tsx
    │   │   ├── categoryTree.ts        # Tree-building utilities
    │   │   ├── components/
    │   │   └── hooks/
    │   │       └── useCategories.ts   # Dual-mode
    │   │
    │   ├── transactions/
    │   │   ├── TransactionsPage.tsx
    │   │   ├── NewTransactionPage.tsx
    │   │   ├── components/
    │   │   └── hooks/
    │   │       └── useTransactions.ts # Dual-mode with local filtering
    │   │
    │   ├── dashboard/
    │   │   ├── DashboardPage.tsx
    │   │   ├── components/            # BalanceHeader, Charts, SummaryTiles, etc.
    │   │   ├── hooks/
    │   │   │   └── useDashboard.ts    # Dual-mode
    │   │   └── utils/
    │   │
    │   └── settings/
    │       └── SettingsPage.tsx        # Theme, account info, sync/link, logout
    │
    ├── routes/                        # TanStack Router file-based routes
    │   ├── __root.tsx                 # Root layout: providers, AuthGuard, BottomNav
    │   ├── index.tsx                  # Landing/login page
    │   ├── register.tsx               # Local user setup (name + email)
    │   ├── callback.tsx               # OAuth callback + auto sync push
    │   ├── dashboard.tsx
    │   ├── settings.tsx
    │   ├── accounts/
    │   │   ├── index.tsx
    │   │   └── new.tsx
    │   ├── categories/
    │   │   ├── index.tsx
    │   │   └── new.tsx
    │   └── transactions/
    │       ├── index.tsx
    │       └── new.tsx
    │
    ├── shared/
    │   ├── ThemeModeToggle.tsx
    │   ├── layout/
    │   │   ├── BottomNav.tsx          # Fixed bottom tab bar (5 slots + center FAB)
    │   │   ├── PageLayout.tsx         # Standard page wrapper
    │   │   ├── NotFoundPage.tsx
    │   │   └── DemoPage.tsx
    │   ├── providers/
    │   │   └── SnackbarProvider.tsx   # Global toast notifications
    │   └── ui/
    │       ├── EmptyState.tsx
    │       ├── HealthIcon.tsx
    │       ├── NavButton.tsx
    │       └── PageHeader.tsx
    │
    └── theme/
        ├── theme.ts                   # MUI theme definitions
        └── themeMode.tsx              # Dark/light mode context
```

---

## Authentication & Auth Modes

The app supports two distinct authentication modes managed by the `LocalAuthProvider` context:

### Mode: `local`

- The user chose "Continue without account" on the landing page.
- They provided a display name and email on the registration page.
- A `LocalUserProfile` record is stored in IndexedDB (single-row, key = "local").
- All data operations go through **IndexedDB** (via `localCrud.ts`).
- No network requests are made for data. The backend is not contacted.
- The AuthGuard allows access to protected routes without server verification.

### Mode: `online`

- The user authenticated via Google OAuth.
- JWT tokens are stored as httponly cookies by the backend.
- All data operations go through the **backend REST API** (via generated Axios clients).
- The AuthGuard verifies the session via `POST /api/v1/oauth/validate` (with caching to avoid excessive calls).

### Mode Transitions

```
none ──(Google login)──→ online
none ──(local setup)───→ local
local ─(link Google)───→ online  (triggers sync push, clears local DB)
online ─(logout)───────→ none
local ──(logout)───────→ none
```

---

## Local Database (IndexedDB)

Managed by **Dexie.js** (`src/lib/localDb.ts`). Database name: `DailyLocalDB`.

### Tables

| Table        | Primary Key | Description                              |
|--------------|-------------|------------------------------------------|
| profile      | key         | Single row (key="local") with user info  |
| accounts     | id (UUID)   | Financial accounts                       |
| categories   | id (UUID)   | Expense/income categories                |
| transactions | id (UUID)   | Financial transactions                   |

### CRUD Operations (`src/lib/localCrud.ts`)

Full create/read/update/delete for all tables. Transaction creation and deletion automatically adjust account balances (same logic as the backend's computed balance column).

All record IDs are client-generated UUIDs (`crypto.randomUUID()`), which ensures they remain globally unique when eventually pushed to the backend.

---

## Sync Push

When a local user links a Google account:

1. The frontend redirects to `GET /api/v1/google/login` (same as normal Google login).
2. On the OAuth callback page (`/callback`), the app:
   - Validates the session with the backend.
   - Checks if there is local data in IndexedDB via `hasLocalData()`.
   - If yes, calls `syncPushToBackend()` — reads all local accounts, categories, and transactions, and POSTs them to `POST /api/v1/sync/push`.
   - On success, calls `clearLocalData()` to wipe IndexedDB.
3. The user is redirected to the dashboard in online mode.

The sync is **idempotent**: the backend skips rows whose UUID already exists. If the sync fails, local data is preserved for a later retry.

A manual sync button is also available in Settings for online users with leftover local data.

---

## Data Fetching Hooks (Dual-Mode Pattern)

Every domain hook (accounts, categories, transactions, dashboard) follows the same pattern:

```typescript
export function useAccounts() {
  const { mode } = useLocalAuth()
  const isLocal = mode === 'local'

  return useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: isLocal
      ? () => getLocalAccounts().then(list => list.map(toAccountIndex))
      : () => accountsApi.getMyAccountsApiV1AccountsGet().then(r => r.data),
  })
}
```

- **Query key** is the same regardless of mode — TanStack Query handles caching and invalidation uniformly.
- **Local mode** calls into `localCrud.ts`, then maps the result to the generated OpenAPI type shape (e.g. `AccountIndex`).
- **Online mode** calls the generated Axios API client.
- Mutations follow the same pattern and invalidate relevant query keys on success.

### Mapper Functions

Local data uses `number` for amounts/balances, while the generated API types use `string` (OpenAPI decimal serialization). Mapper functions like `toAccountIndex()` handle this conversion.

---

## Routes

| Path              | Component          | Auth      | Description                           |
|-------------------|--------------------|-----------|---------------------------------------|
| /                 | Landing page       | Public    | Google login + "Continue locally"     |
| /register         | Local user setup   | Public    | Name + email form → IndexedDB        |
| /callback         | OAuth callback     | Public    | Session validation + auto sync push   |
| /dashboard        | DashboardPage      | Protected | Balance overview, charts, recent txns |
| /accounts         | AccountsPage       | Protected | List of accounts                      |
| /accounts/new     | CreateAccountPage  | Protected | New account form                      |
| /categories       | CategoriesPage     | Protected | Category list (expense/income tabs)   |
| /categories/new   | CreateCategoryPage | Protected | New category form                     |
| /transactions     | TransactionsPage   | Protected | Transaction list                      |
| /transactions/new | NewTransactionPage | Protected | New transaction form                  |
| /settings         | SettingsPage       | Protected | Theme, account info, sync, logout     |

"Protected" means the route requires either local or online authentication.

---

## Component Tree

```
<ThemeModeProvider>
  <SnackbarProvider>
    <LocalAuthProvider>              ← auth mode context
      <ThemeProvider theme={...}>
        <CssBaseline />
        <AuthGuard>                  ← route protection
          <Outlet />                 ← page content
        </AuthGuard>
        <BottomNav />                ← fixed bottom tab bar
      </ThemeProvider>
    </LocalAuthProvider>
  </SnackbarProvider>
</ThemeModeProvider>
```

### AuthGuard Logic

1. **Public paths** (`/`, `/callback`, `/register`) → render immediately.
2. **Local mode** → render immediately (no server check needed).
3. **Undetermined mode** → show spinner while checking IndexedDB for a local profile.
4. **Online mode** → verify via `useAuthVerification` (validate → refresh → redirect on failure).

---

## Settings Page

The settings page adapts its content based on the auth mode:

### Local Mode
- Shows user profile (name, email) with a "Local" chip.
- "Data stored locally" notice.
- **"Link Google"** button — redirects to Google OAuth to sync and switch to online mode.
- Theme toggle.
- Logout button.

### Online Mode
- Shows "Google Account" with a "Online" chip.
- **"Sync now"** button — manually pushes any leftover local data.
- Theme toggle.
- Logout button (calls `POST /api/v1/oauth/logout` to clear cookies).

---

## Bottom Navigation

A fixed bar at the bottom with 5 slots:

| Slot | Icon              | Route              |
|------|-------------------|--------------------|
| 1    | Home              | /dashboard         |
| 2    | Accounts          | /accounts          |
| 3    | + (FAB)           | /transactions/new  |
| 4    | Categories        | /categories        |
| 5    | Settings          | /settings          |

Hidden on public pages (`/`, `/callback`, `/register`).

---

## API Client Architecture

```
apiClient (axios)          ← shared instance with response interceptor
  ├── accountsApi          ← generated OpenAPI client
  ├── categoriesApi
  ├── transactionsApi
  ├── dashboardApi
  └── oauthApi

authAxios (axios)          ← interceptor-free instance (avoids refresh loops)
  └── authOauthApi         ← used only for validate/refresh/logout
```

### Response Interceptor

Attached to `apiClient` via `initResponseHandler()`:

1. **401** → silently attempts token refresh via `authOauthApi`. If refresh succeeds, replays the original request. If refresh fails, redirects to login.
2. **Other errors** → extracts server message, shows a toast.
3. Uses a separate `authAxios` instance for auth calls to avoid infinite refresh loops.

---

## Theme

Supports **dark** and **light** modes, persisted in `localStorage`. Toggled via `ThemeModeToggle` in Settings.

---

## Running

```bash
cd frontend
npm install
npm start         # Vite dev server on port 3000
```

### Build

```bash
npm run build     # Output in dist/
```

### API Code Generation

Requires the backend running on port 8000:

```bash
npm run gen-api   # Regenerates src/api/generated/ from OpenAPI spec
```

---

## Environment Variables

| Variable              | Description                    | Default                  |
|-----------------------|--------------------------------|--------------------------|
| VITE_API_BASE_URL     | Backend API base URL           | `window.location.origin` |

Can be overridden at runtime via `public/env.js` (sets `window.__ENV__.VITE_API_BASE_URL`).
