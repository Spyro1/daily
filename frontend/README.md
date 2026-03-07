# Daily Frontend

Mobile-first authentication frontend for the Daily app, built as a TanStack Router SPA with React Query and Material UI.

## Run

```bash
npm install
npm run start
```

## Build

```bash
npm run build
```

## Environment

- Optional: `VITE_API_BASE_URL`
  - Default: `http://localhost:8000`
  - Used by the generated API client and the `/api` Vite proxy.

## Runtime Overrides

- `public/env.js` can inject `window.__ENV__.VITE_API_BASE_URL` at deploy time.
- Resolution order is runtime env, then Vite env, then the current origin.
