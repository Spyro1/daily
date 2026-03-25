# PWA & Offline Architecture

Daily is a fully installable Progressive Web App (PWA) that works without an internet connection. This document explains every layer of the offline system — from caching static assets to queuing mutations and syncing them back when connectivity returns.

---

## Table of Contents

1. [Installation & Service Worker](#1-installation--service-worker)
2. [Caching Strategy](#2-caching-strategy)
3. [Offline Mutation Queue](#3-offline-mutation-queue)
4. [Sync Manager](#4-sync-manager)
5. [UI Layer](#5-ui-layer)
6. [Lifecycle of an Offline Mutation](#6-lifecycle-of-an-offline-mutation)
7. [App Update Flow](#7-app-update-flow)
8. [File Map](#8-file-map)

---

## 1. Installation & Service Worker

The app uses **`vite-plugin-pwa`** (Workbox under the hood) to generate a service worker at build time. The configuration lives in `vite.config.ts` inside the `VitePWA()` plugin call.

| Setting | Value | Why |
|---|---|---|
| `registerType` | `'prompt'` | Users are asked before an update is applied — prevents data loss mid-session |
| `display` | `'standalone'` | Hides the browser chrome — feels like a native app |
| `start_url` | `'/'` | Ensures the app always opens at the root |

The generated `manifest.webmanifest` provides the metadata browsers need to show the **"Add to Home Screen"** prompt on mobile devices.

---

## 2. Caching Strategy

### Static Assets (Precache)

Every JS chunk, CSS file, HTML page, icon, and font is **precached** during service worker installation:

```
globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
```

This means the entire app shell is available offline immediately after the first visit. `env.js` is excluded from the precache because it contains environment-specific config that may change between deploys — it has its own `NetworkFirst` rule instead.

### API Responses (Runtime Cache)

GET requests to `/api/v1/*` use a **`NetworkFirst`** strategy with a 3-second timeout:

```
urlPattern: /\/api\/v1\//
handler:    'NetworkFirst'
networkTimeoutSeconds: 3
```

**Online:** Responses are fetched from the network and stored in an `api-cache` IndexedDB cache (up to 100 entries, 7-day TTL).

**Offline:** If the network is unreachable (or takes >3 s), the last cached response is returned. This means any page the user has visited before will display its data correctly while offline.

### Navigation Requests

All navigation requests fall back to `index.html` via `navigateFallback`, except paths starting with `/api` (handled by the backend). This allows client-side routing to work entirely offline.

---

## 3. Offline Mutation Queue

**File:** `src/pwa/offlineQueue.ts`

When the device is offline and the user performs a create, update, or delete action, the mutation is persisted in **IndexedDB** (database `daily-offline`, object store `mutation-queue`).

Each entry stores:

```typescript
interface QueuedMutation {
  id: string        // unique key (timestamp + random suffix)
  timestamp: number  // Date.now() — used for FIFO ordering
  method: string     // POST | PATCH | PUT | DELETE
  url: string        // e.g. "/api/v1/accounts"
  data?: unknown     // the JSON request body
}
```

The queue survives page reloads, app restarts, and even device reboots — IndexedDB is persistent storage.

### How mutations get queued

**File:** `src/pwa/offlineInterceptor.ts`

An Axios **response interceptor** (registered before the error/auth interceptor) catches network errors on mutation methods:

```
POST, PATCH, PUT, DELETE → queue in IndexedDB
GET                      → let it fail normally (SW runtime cache handles reads)
```

When a mutation is queued:

1. The request details are written to IndexedDB
2. A **mock 200 response** is returned to the calling code
3. The mutation hook's `onSuccess` callback fires normally — cache invalidation runs, the UI updates
4. A toast appears: *"Saved offline — will sync when connected"*

This provides an **optimistic offline UX** — the user doesn't need to know or care that the network is down.

#### Replay guard

Requests replayed by the sync manager carry a `X-Offline-Replay` header. The interceptor skips these to avoid re-queuing a replay that itself fails due to a momentary network blip.

---

## 4. Sync Manager

**File:** `src/pwa/syncManager.ts`

The sync manager is the bridge between the offline queue and the backend. It is initialised once at app startup (`main.tsx`) and listens for the browser's `online` event.

### Replay algorithm

```
1. Read all queued mutations (oldest first)
2. For each mutation:
   a. Replay via the shared Axios client (with auth cookies)
   b. On success → remove from queue, increment counter
   c. On network error → STOP (still offline)
   d. On server error (4xx/5xx) → DISCARD and continue
      (the error toast is shown by the existing responseHandler)
3. After processing:
   - Invalidate ALL React Query caches (full refresh)
   - Show toast: "Synced N offline changes"
   - Broadcast new queue count to UI subscribers
```

**Why discard on server errors?** If the backend rejects a mutation (e.g. 409 Conflict, 422 Validation), retrying it forever would never succeed. The error is surfaced to the user via the existing Axios error-toast system.

### Pub/Sub

The sync manager exposes a `subscribe(fn)` function that UI components use to track:
- `pending` — number of mutations still in the queue
- `syncing` — whether a sync is currently in progress

---

## 5. UI Layer

### Offline Banner

**File:** `src/pwa/OfflineBanner.tsx`

A `<Collapse>`-animated banner rendered at the top of the root layout:

| State | Appearance |
|---|---|
| **Offline, no pending** | ⚠️ *"You're offline — changes will be saved locally"* |
| **Offline, N pending** | ⚠️ *"You're offline — 3 changes will sync when connected"* |
| **Online, syncing** | ℹ️ *"Syncing 3 offline changes…"* + progress bar |
| **Online, idle** | Hidden |

### Update Prompt

**File:** `src/pwa/UpdatePrompt.tsx`

When the service worker detects a new app version (checked every hour via `periodicSyncForUpdates`), a snackbar appears:

> *"A new version of Daily is available"* → **[Reload]**

Clicking Reload activates the waiting service worker and refreshes the page. This uses the `prompt` registration type — updates are never applied silently mid-session.

### React Hooks

| Hook | Returns | Source |
|---|---|---|
| `useOnlineStatus()` | `boolean` | Browser `online`/`offline` events via `useSyncExternalStore` |
| `usePendingSync()` | `{ pending: number, syncing: boolean }` | Sync manager's pub/sub |

These hooks can be used anywhere in the app to conditionally render UI based on connectivity or sync state.

---

## 6. Lifecycle of an Offline Mutation

Here's the complete path of a mutation made while offline:

```
User taps "Create Account"
        │
        ▼
useMutation fires ──▶ Axios POST /api/v1/accounts
        │
        ▼
Network fails (no response)
        │
        ▼
offlineInterceptor catches the error
        │
        ├─ Is it a mutation method? ✅
        ├─ Is it a replay request?  ❌
        │
        ▼
Writes to IndexedDB: { method: "POST", url: "/api/v1/accounts", data: {...} }
        │
        ├─ Returns mock { status: 200 } to Axios
        ├─ Toast: "Saved offline — will sync when connected"
        │
        ▼
useMutation.onSuccess fires
        ├─ invalidateQueries(accounts.all)
        ├─ invalidateQueries(dashboard)
        │   └─ These re-fetch from SW cache (stale but available)
        │
        ▼
OfflineBanner updates: "1 change will sync when connected"

        ═══════════ time passes ═══════════

Device comes back online
        │
        ▼
window "online" event fires
        │
        ▼
syncManager.processQueue()
        │
        ├─ Reads all mutations from IndexedDB
        ├─ Replays POST /api/v1/accounts with original body
        │   └─ X-Offline-Replay header added
        ├─ Backend processes it successfully
        ├─ Removes entry from IndexedDB
        │
        ▼
invalidateQueries() — all caches refreshed from network
Toast: "Synced 1 offline change"
OfflineBanner hides
```

---

## 7. App Update Flow

```
Workbox detects new SW version (hourly check)
        │
        ▼
onNeedRefresh callback fires
        │
        ▼
UpdatePrompt renders Snackbar:
  "A new version of Daily is available" [Reload]
        │
        ▼
User clicks Reload
        │
        ├─ updateServiceWorker(true)
        ├─ New SW activates, takes control
        ├─ Page reloads with fresh precached assets
        │
        ▼
New version is live ✅
```

---

## 8. File Map

```
src/pwa/
├── index.ts                 # Public barrel export
├── offlineQueue.ts          # IndexedDB FIFO queue (enqueue, dequeue, getAll, count, clear)
├── offlineInterceptor.ts    # Axios interceptor — queues failed mutations
├── syncManager.ts           # Replays queue on reconnect, pub/sub for UI
├── useOnlineStatus.ts       # React hook — navigator.onLine reactive state
├── usePendingSync.ts        # React hook — { pending, syncing } from syncManager
├── OfflineBanner.tsx         # Top banner — offline warning / sync progress
└── UpdatePrompt.tsx          # Snackbar — new version available prompt

vite.config.ts               # VitePWA plugin config (manifest, workbox, caching rules)
```

### Integration points

| File | What was changed |
|---|---|
| `main.tsx` | Calls `initOfflineInterceptor()` + `initSyncManager()` at startup |
| `routes/__root.tsx` | Renders `<OfflineBanner />` and `<UpdatePrompt />` in the root layout |
| `tsconfig.json` | Added `vite-plugin-pwa/react` to `types` |
| `index.html` | Removed manual `<link rel="manifest">` (VitePWA injects it) |
