# Frontend Documentation

Last updated: 2026-05-04

## Overview

Frontend stack:
- React 19
- TypeScript
- TanStack Router, queries, mutations
- Dexie (IndexedDB)
- MUI 7

## App Composition

Entry:
- `src/main.tsx`: QueryClientProvider + RouterProvider
- `src/router.tsx`: router creation from generated route tree

Root route (`src/routes/__root.tsx`):
- Theme provider
- Snackbar provider
- Local auth provider
- Auth guard
- API response interceptor setup
- Offline queue replay setup

## Route Map

Public routes:
- `/`
- `/register`
- `/callback`

Protected routes:
- `/dashboard`
- `/settings`
- `/accounts`, `/accounts/new`, `/accounts/$id`
- `/categories`, `/categories/new`, `/categories/$id`
- `/transactions`, `/transactions/new`, `/transactions/$id`

## Auth Modes

`useLocalAuth` modes:
- `undetermined`
- `none`
- `local`
- `online`

Behavior:
- local mode: IndexedDB-backed data only
- online mode: backend API + cookie auth

## Data Strategy

Domain hooks (`useAccounts`, `useCategories`, `useTransactions`, `useDashboard`) follow dual-mode query/mutation logic:
- local mode -> `localCrud.ts`
- online mode -> generated API clients

Mutations invalidate relevant query keys after success.

## Offline and Sync

Local storage layers:
- IndexedDB (Dexie): `localDb.ts`
- Offline mutation queue: `offlineQueue.ts` (`localStorage`)

Sync flow:
- callback page validates session
- if local data exists, sends it to `POST /api/v1/sync/push`
- on success clears local DB

## Build and Run

```bash
npm install
npm run start
npm run build
npm run test
npm run lint
```
