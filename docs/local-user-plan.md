# Local and Online User Strategy

Last updated: 2026-05-04

## Current Design

Identity model:
- internal `users.id` is the stable principal
- provider mapping in `provided_users` (`provider_id` + `provider_user_id`)

Frontend auth modes:
- local mode (IndexedDB only)
- online mode (Google OAuth + backend cookies)

Current sync behavior:
- local data can be pushed to backend via `/api/v1/sync/push`
- push is idempotent on existing IDs

## Practical Notes

- local mode is currently frontend-managed, not backend account login
- online mode relies on OAuth callback and cookies
- queue replay supports offline online-mode mutation buffering

## Suggested Next Improvements

1. Add explicit local-login backend endpoint only if product needs server-side local identity.
2. Add pull-sync endpoint if bidirectional sync is required.
3. Add operation IDs for stronger replay idempotency diagnostics.
4. Add conflict reporting UX for queued mutation failures.
