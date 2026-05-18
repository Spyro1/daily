# Implementation Plan

Last updated: 2026-05-04

## Current State

Core CRUD and auth/sync flows are implemented for:
- accounts
- categories
- transactions
- dashboard
- Google OAuth login
- local mode + offline queue + sync push

## Remaining Technical Work

1. Security hardening
- move secrets out of tracked env files
- define production cookie/domain policy explicitly

2. Data and sync robustness
- add clearer retry/backoff policy for replay queue
- add conflict telemetry for replay failures

3. API and model cleanup
- decide whether `overwrite` transaction type remains in DB constraints
- finish account opening-balance and adjustment TODOs

4. Performance
- split heavy frontend bundles (dashboard/main chunks)
- add selective backend query-level profiling

5. Quality
- increase backend tests around auth edge cases and sync idempotency paths
- add frontend tests for callback/offline replay flows
