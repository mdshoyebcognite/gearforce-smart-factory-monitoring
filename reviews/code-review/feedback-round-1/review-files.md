# File inventory: GearForce Smart Factory Monitoring

Reviewed commit: `d150309bd14b5d8f83b54c6f85ef930e4002dd9b`

Config: `vitest.config.ts`, `vite.config.ts` (if present), `vitest.setup.ts`

| File | Structure | Quality | Patterns | Tests | Notes |
| ---- | --------- | ------- | -------- | ----- | ----- |
| `src/main.tsx` | entry | OK | bootstrap | ✗ | allowed untested entry |
| `src/App.tsx` | shell | OK | SDK provider + investigation | ✓ `App.test.tsx` | host connect `useEffect` with cleanup |
| `src/config/gearforceConfig.ts` | config | OK | constants | ✗ | thresholds, view refs |
| `src/lib/utils.ts` | util | OK | `cn` helper | ✗ | trivial |
| `src/types/gearforce.ts` | types | OK | domain | ✗ | |
| `src/types/cdfSchemas.ts` | types | OK | Zod | ✓ via mapper tests | |
| `src/contexts/appServicesTypes.ts` | types | OK | DI contracts | ✓ context tests | |
| `src/contexts/appServicesContextValue.ts` | context | OK | createContext | ✓ | |
| `src/contexts/AppServicesContext.tsx` | context | OK | provider | ✓ | |
| `src/hooks/useAppServices.ts` | hook | OK | context consumer | ✓ indirect | |
| `src/hooks/useInvestigationState.ts` | hook | OK | host-synced state | ✓ | |
| `src/services/interfaces/*.ts` | interfaces | OK | service ports | ✗ | contracts only |
| `src/services/createDefaultAppServices.ts` | factory | OK | DI wiring | ✗ | thin factory |
| `src/services/CdfMachineDataService.ts` | service | OK | DMS list + map | ✓ | |
| `src/services/CdfSensorDataService.ts` | service | OK | list + cache + filter | ✓ | client filter on ≤16 sensors |
| `src/services/CdfTimeseriesDataService.ts` | service | OK | datapoints API | ✓ | per-series `externalId` |
| `src/services/CdfAnomalyService.ts` | service | OK | function call read | ✓ | read-only detector output |
| `src/services/mappers/cdfInstanceHelpers.ts` | mapper | OK | `instances.list` limit 100 | ✓ | |
| `src/services/mappers/gearforceMappers.ts` | mapper | OK | view → domain | ✓ extensive | anomaly parsing resilient |
| `src/viewModels/useFactoryOverviewViewModel.ts` | VM | OK | React Query + services | ✓ | |
| `src/viewModels/useMachineDetailViewModel.ts` | VM | OK | React Query | ✗ dedicated | covered indirectly in dashboard tests |
| `src/viewModels/useSensorDetailViewModel.ts` | VM | OK | reading + trend + anomaly | ✓ partial coverage | |
| `src/viewModels/useAnomalyViewModel.ts` | VM | OK | trace helpers | ✓ | |
| `src/components/common/AsyncStateBoundary.tsx` | UI | OK | loading/error/empty | ✓ | |
| `src/components/layout/AppShell.tsx` | UI | OK | TopBar + routes panels | ✓ | |
| `src/components/layout/TopBar.tsx` | UI | OK | Aura tabs/KPIs | ✗ | |
| `src/components/dashboard/FactoryDashboard.tsx` | UI | ⚠ large | VMs + Aura | ✓ | **544 lines**; live overview + machine UX |
| `src/components/dashboard/sensorTypeMeta.tsx` | UI | OK | icons/thresholds | ✓ indirect | |
| `src/components/overview/FactoryOverviewPanel.tsx` | UI | OK | duplicate overview | ✓ | **not wired in AppShell** |
| `src/components/machine/MachineDetailPanel.tsx` | UI | OK | duplicate machine | ✓ | **not wired in AppShell** |
| `src/components/machine/MachineHealthBadge.tsx` | UI | OK | badge | ✓ | used by legacy panel |
| `src/components/sensor/SensorDetailPanel.tsx` | UI | OK | duplicate sensor | ✓ | **not wired in AppShell** |
| `src/components/sensor/SensorTrendChart.tsx` | UI | OK | SVG chart | ✓ | |
| `src/components/anomaly/AnomalyPanel.tsx` | UI | OK | anomaly list/trace | ✓ | live path |
| `src/testUtils/renderWithAppServices.tsx` | test util | OK | DI test harness | — | |
| `src/__mocks__/gearforceFixtures.ts` | fixtures | OK | test data | — | |

All other `src/**/*.test.ts(x)` files: test-only; excluded from production inventory.

**Production files read (non-trivial):** services layer, mappers, view models, `App.tsx`, `AppShell`, `FactoryDashboard`, `AnomalyPanel`, `AsyncStateBoundary`, investigation hook, contexts.
