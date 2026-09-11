# Findings: GearForce Smart Factory Monitoring — round 2

Round 1's single Must Fix (unreachable duplicate panels) has been resolved by deleting the dead components and their tests. Live path is unchanged: `App.tsx` → `AppShell` → `FactoryDashboard` + `AnomalyPanel`.

## Config inspected

- Coverage config file(s): `vitest.config.ts`
- Production paths excluded from coverage: `node_modules/`, `dist/`, `.claude/`, `.agents/`, `vitest.setup.ts`, `**/*.config.ts`, `**/*.d.ts` (allowed set only)
- Tests excluded from the test run: Vitest `configDefaults.exclude` plus `.claude/**`, `.agents/**` (allowed)

## Searches

| Check | Hits (file:line or none) |
| ----- | ------------------------ |
| ErrorBoundary | none |
| TODO/FIXME (prod) | none |
| coverage/test exclude | `vitest.config.ts:17-21` — allowed excludes only |
| CDF Raw | none |
| instances.list/query/search | `src/services/mappers/cdfInstanceHelpers.ts:9` (`instances.list`, `limit: 100`) |
| QueuedTaskRunner / 429 | none |
| any / vi.mock (prod) | none in production; `as unknown as CogniteClient` in `*.test.ts` only |
| lint / tsc | `npm run lint` exit 0; `npx tsc --noEmit` exit 0 |
| CogniteClient / DI / ViewModel | DI via `AppServicesContext`; ViewModels under `src/viewModels/`; `new CogniteClient` only in tests/`renderWithAppServices` |
| unused / unreachable UI | **none** (dead panels removed) |
| console.log | none |
| Route / react-router | none (single-page investigation state) |
| components > 150 lines | `src/components/dashboard/FactoryDashboard.tsx` (~560 lines) |
| useEffect | `src/App.tsx:81-90` — host connect with `cancelled` cleanup (OK) |

## Deleted in this round (dead code, not in runtime path)

- `src/components/overview/FactoryOverviewPanel.tsx` (+ test)
- `src/components/machine/MachineDetailPanel.tsx` (+ test)
- `src/components/sensor/SensorDetailPanel.tsx` (+ test)
- `src/components/machine/MachineHealthBadge.tsx` (+ test) — only consumed by the removed overview panel

Post-deletion verification: `tsc` 0, `lint` 0, `vitest` 16 files / 67 tests passing, `vite build` OK, coverage 93.8% lines / 81.15% branches.

## Must / should / nice

### Must fix

- None.

### Should fix

- [ ] No React ErrorBoundary at app root (`src/App.tsx`) — criterion 1.1
- [ ] Machine details block lacks explicit loading/error boundary — `src/components/dashboard/FactoryDashboard.tsx` — criterion 1.1
- [ ] No `QueuedTaskRunner` / explicit 429 backoff (relies on React Query defaults) — criterion 2.5
- [ ] `FactoryDashboard.tsx` mixes layout + fetch orchestration (~560 lines) — criterion 1.6
- [ ] `useMachineDetailViewModel` has no dedicated unit test — criterion 1.4
- [ ] Vitest 4.1.10 moderate advisory (patch 4.1.11) — devDependency — criterion 1.3

### Nice fix

- [ ] `@cognite/app-sdk` 0.9.0 vs 0.10.0 — `package.json`
- [ ] Hard-coded KPI asset count `"11"` — `FactoryDashboard.tsx`
- [ ] DMS reads use `instances.list` only — fine at GearForce scale — criterion 2.1
