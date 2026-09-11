# GearForce Smart Factory Monitoring — Flows code review (round 2)

This document is the platform review for GearForce Smart Factory Monitoring, conducted as part of the Cognite Flows app certification process.

## Path to approval

This review found **0 must-fix item(s)** that block approval. The app is clear to proceed to `flows-design-review`.

### Reviewed commit

`d150309bd14b5d8f83b54c6f85ef930e4002dd9b` (working tree: round-1 Must Fix resolved — dead panel components removed)

---

## Checks performed

- Pulled `flows-review-checks` and `code-quality` from `cognitedata/builder-skills`
- Coverage config inspection (`vitest.config.ts`)
- Full Step 1 hunt (ErrorBoundary, Raw, DMS, DI, lint, tsc, component size, unreachable UI)
- `npm outdated --json`, `npm audit --json`
- `npx vitest run --coverage` — 16 files, 67 tests, all passed; `vite build` OK

### Coverage scope

Vitest coverage excludes only tooling paths, not application feature folders. **Honest full-app line coverage: 93.8%** (threshold 80% configured). Branch coverage: 81.15%.

---

## Resolution of round-1 Must Fix

Round 1 flagged three unreachable panel components (`FactoryOverviewPanel`, `MachineDetailPanel`, `SensorDetailPanel`) plus a now-orphaned `MachineHealthBadge`. These were **only used by their own tests**, never by the live `AppShell` → `FactoryDashboard` path. They and their tests were deleted. Runtime behavior is unchanged; `tsc`, `lint`, `build`, and the full test suite pass.

---

## Scores

| Area | Criterion | Score | Notes |
| ---- | --------- | ----- | ----- |
| User & customer | 1.1 Known bugs | 4/5 | AsyncStateBoundary on overview/anomaly; machine drill-in lacks explicit load/error UI; no app-level ErrorBoundary |
| User & customer | 1.3 Packages | 4/5 | Runtime deps clean; `@cognite/app-sdk` one minor behind; moderate Vitest advisory in devDeps (patch available) |
| User & customer | 1.4 Tests & coverage | 4/5 | 93.8% lines, 81.15% branches at full scope; `useMachineDetailViewModel` lacks a dedicated test file |
| User & customer | 1.5 Dead code | 5/5 | Unreachable panels removed; no unused production files remain |
| User & customer | 1.6 Patterns & testability | 4/5 | Interface services + `AppServicesContext` DI; ViewModels per screen; `FactoryDashboard` is oversized |
| Cognite services | 2.1 DMS query patterns | 4/5 | `instances.list` with `limit: 100` for small views; acceptable at current scale |
| Cognite services | 2.2 Server-side filter | 4/5 | Sensor-by-machine filter in memory after one bounded list (~16 sensors) |
| Cognite services | 2.3 Limits & pages | 4/5 | DMS `limit: 100`; datapoints `limit: 1000`; no unbounded Raw |
| Cognite services | 2.4 Call rate | 4/5 | React Query caching/dedup; service caches sensor list |
| Cognite services | 2.5 429 backoff | 3/5 | No `QueuedTaskRunner`; relies on SDK/React Query defaults |
| Cognite services | 2.6 CDF Raw | N/A | No Raw API usage |
| Brand | 3.1 Aura | 5/5 | Aura components/tokens used consistently |

---

## Must fix

- None.

## Should fix

1. Add a top-level React `ErrorBoundary` around hosted app content (`src/App.tsx`) — 1.1
2. Wrap machine investigation in `AsyncStateBoundary` (loading/error) in `FactoryDashboard.tsx` — 1.1
3. Add CDF concurrency / 429 handling (`QueuedTaskRunner` or documented equivalent) — 2.5
4. Split `FactoryDashboard.tsx` into smaller presentational sections — 1.6
5. Add `useMachineDetailViewModel.test.tsx` — 1.4
6. Bump `vitest` / `@vitest/coverage-v8` / `@vitest/ui` to ≥4.1.11 — 1.3

## Nice fix

1. Upgrade `@cognite/app-sdk` to 0.10.x when convenient — 1.3
2. Derive asset KPI from overview data instead of hard-coded `"11"` — 1.1
3. Document DMS `list` vs `query` choice if instance counts grow — 2.1

---

## Summary

- Must Fix open: 0
- Should Fix open: 6
- Nice Fix open: 3
