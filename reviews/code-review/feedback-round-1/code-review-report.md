# GearForce Smart Factory Monitoring — Flows code review

This document is the platform review for GearForce Smart Factory Monitoring, conducted as part of the Cognite Flows app certification process.

## Path to approval

This review found **1 must-fix item(s)** that block approval. Once the must-fix items are addressed, re-run `flows-code-review`.

### Reviewed commit

`d150309bd14b5d8f83b54c6f85ef930e4002dd9b`

---

## Checks performed

- Pulled `flows-review-checks` and `code-quality` from `cognitedata/builder-skills` via `npx @cognite/cli@latest apps skills pull`
- Coverage config inspection (`vitest.config.ts`)
- Full Step 1 hunt (ErrorBoundary, Raw, DMS, DI, lint, tsc, component size, unreachable UI)
- `npm outdated --json`, `npm audit --json`
- `npx vitest run --coverage` — 20 files, 76 tests, all passed

### Coverage scope

Vitest coverage excludes only tooling paths (`**/*.config.ts`, `vitest.setup.ts`, etc.), not application feature folders. **Honest full-app line coverage: 94.45%** (threshold 80% configured). Branch coverage: 80.17%.

---

## Scores

| Area | Criterion | Score | Notes |
| ---- | --------- | ----- | ----- |
| User & customer | 1.1 Known bugs | 4/5 | AsyncStateBoundary on overview/anomaly; machine drill-in lacks explicit load/error UI; no app-level ErrorBoundary |
| User & customer | 1.3 Packages | 4/5 | Runtime deps clean; `@cognite/app-sdk` one minor behind; moderate Vitest advisory in devDeps (patch available) |
| User & customer | 1.4 Tests & coverage | 4/5 | 94.45% lines, 80.17% branches; `useMachineDetailViewModel` lacks dedicated test file |
| User & customer | 1.5 Dead code | 2/5 | Three production panel components duplicate live `FactoryDashboard` UX but are unreachable in AppShell |
| User & customer | 1.6 Patterns & testability | 4/5 | Interface services + `AppServicesContext`; ViewModels for screens; `FactoryDashboard` is oversized |
| Cognite services | 2.1 DMS query patterns | 4/5 | `instances.list` with `limit: 100` for small GearForce views; acceptable at current scale |
| Cognite services | 2.2 Server-side filter | 4/5 | Sensor-by-machine filter is in-memory after one bounded list (~16 sensors) |
| Cognite services | 2.3 Limits & pages | 4/5 | DMS `limit: 100`; datapoints `limit: 1000`; no unbounded Raw |
| Cognite services | 2.4 Call rate | 4/5 | React Query caching/dedup; sensor list cached in service |
| Cognite services | 2.5 429 backoff | 3/5 | No `QueuedTaskRunner`; relies on SDK/React Query defaults |
| Cognite services | 2.6 CDF Raw | N/A | No Raw API usage |
| Brand | 3.1 Aura | 5/5 | Aura components/tokens used consistently |

---

## Must fix

1. **Remove or wire unreachable panel components** (`FactoryOverviewPanel`, `MachineDetailPanel`, `SensorDetailPanel`)  
   Files: `src/components/overview/FactoryOverviewPanel.tsx`, `src/components/machine/MachineDetailPanel.tsx`, `src/components/sensor/SensorDetailPanel.tsx`  
   Criterion: 1.5  
   _Impact:_ Engineers may change dead UI while users only see `FactoryDashboard`, causing repeated certification failures and production regressions.

---

## Should fix

1. Add a top-level React `ErrorBoundary` around the hosted app content (`src/App.tsx`) — 1.1  
2. Wrap machine investigation in `AsyncStateBoundary` (loading/error) in `FactoryDashboard.tsx` — 1.1  
3. Add CDF concurrency / 429 handling (`QueuedTaskRunner` or documented equivalent) — 2.5  
4. Split `FactoryDashboard.tsx` into smaller presentational sections — 1.6  
5. Add `useMachineDetailViewModel.test.tsx` — 1.4  
6. Bump `vitest` / `@vitest/coverage-v8` / `@vitest/ui` to ≥4.1.11 — 1.3  

---

## Nice fix

1. Upgrade `@cognite/app-sdk` to 0.10.x when convenient — 1.3  
2. Derive asset KPI from overview data instead of hard-coded `"11"` — 1.1  
3. Document DMS `list` vs `query` choice if instance counts grow — 2.1  

---

## Summary

- Must Fix open: 1
- Should Fix open: 6
- Nice Fix open: 3
