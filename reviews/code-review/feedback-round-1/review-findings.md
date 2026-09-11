# Findings: GearForce Smart Factory Monitoring

## Config inspected

- Coverage config file(s): `vitest.config.ts`
- Production paths excluded from coverage: `node_modules/`, `dist/`, `.claude/`, `.agents/`, `vitest.setup.ts`, `**/*.config.ts`, `**/*.d.ts` (allowed set; no `src/pages/`, `src/components/`, or feature modules hidden)
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
| CogniteClient / DI / ViewModel | DI: `src/contexts/AppServicesContext.tsx`, `src/services/createDefaultAppServices.ts`; ViewModels under `src/viewModels/`; `new CogniteClient` only in tests/`renderWithAppServices` |
| unused / unreachable UI | `FactoryOverviewPanel`, `MachineDetailPanel`, `SensorDetailPanel` — not imported from `AppShell` / `FactoryDashboard` (production path uses `FactoryDashboard` + `AnomalyPanel` only) |
| console.log | none |
| Route / react-router | none (single-page investigation state) |
| components > 150 lines | `src/components/dashboard/FactoryDashboard.tsx` (544 lines) |
| useEffect | `src/App.tsx:81-90` — host connect with `cancelled` cleanup (OK) |

## Must / should / nice

### Must fix

- [ ] **Unreachable duplicate screen components** — `src/components/overview/FactoryOverviewPanel.tsx`, `src/components/machine/MachineDetailPanel.tsx`, `src/components/sensor/SensorDetailPanel.tsx` — criterion **1.5**  
  _Impact:_ Production UI is driven by `FactoryDashboard`; maintaining parallel panel implementations risks fixing the wrong tree and shipping UI that never runs in Fusion.

### Should fix

- [ ] **No React ErrorBoundary** — app root `src/App.tsx` — criterion **1.1**
- [ ] **Machine details block has no loading/error boundary** — `src/components/dashboard/FactoryDashboard.tsx:337` (renders only when `machineVm.machine` is truthy; failed fetch shows blank) — criterion **1.1**
- [ ] **No `QueuedTaskRunner` / explicit 429 backoff** — CDF calls rely on TanStack Query defaults only — criterion **2.5**
- [ ] **`FactoryDashboard` mixes layout, KPIs, hierarchy, anomalies strip, and machine investigation** (544 lines) — criterion **1.6**
- [ ] **`useMachineDetailViewModel` has no dedicated unit test file** — `src/viewModels/useMachineDetailViewModel.ts` — criterion **1.4**
- [ ] **Vitest 4.1.10 moderate advisory** (path traversal in `@vitest/mocker`; fix in 4.1.11) — devDependency — criterion **1.3**

### Nice fix

- [ ] **Production dependency `@cognite/app-sdk` 0.9.0 vs latest 0.10.0** — `package.json`
- [ ] **Hard-coded KPI asset count `"11"`** — `src/components/dashboard/FactoryDashboard.tsx:133` (could derive from overview)
- [ ] **DMS reads use `instances.list` only** — acceptable at GearForce scale; document or move to `query` if instance count grows — criterion **2.1**
