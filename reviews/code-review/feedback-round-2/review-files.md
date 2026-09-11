# File inventory: GearForce Smart Factory Monitoring — round 2

Reviewed commit: `d150309bd14b5d8f83b54c6f85ef930e4002dd9b` (working tree: dead panels removed)

| File | Structure | Quality | Patterns | Tests | Notes |
| ---- | --------- | ------- | -------- | ----- | ----- |
| `src/main.tsx` | entry | OK | bootstrap | ✗ | allowed untested entry |
| `src/App.tsx` | shell | OK | SDK provider + investigation | ✓ `App.test.tsx` | host connect `useEffect` with cleanup |
| `src/config/gearforceConfig.ts` | config | OK | constants | ✗ | thresholds, view refs |
| `src/lib/utils.ts` | util | OK | `cn` helper | ✗ | trivial |
| `src/types/gearforce.ts` | types | OK | domain | ✗ | |
| `src/types/cdfSchemas.ts` | types | OK | Zod | ✓ via mapper tests | |
| `src/contexts/*` | context | OK | DI | ✓ | provider + typed context |
| `src/hooks/useAppServices.ts` | hook | OK | context consumer | ✓ indirect | |
| `src/hooks/useInvestigationState.ts` | hook | OK | host-synced state | ✓ | |
| `src/services/interfaces/*.ts` | interfaces | OK | ports | ✗ | contracts only |
| `src/services/createDefaultAppServices.ts` | factory | OK | DI wiring | ✗ | thin factory |
| `src/services/CdfMachineDataService.ts` | service | OK | DMS list + map | ✓ | |
| `src/services/CdfSensorDataService.ts` | service | OK | list + cache + filter | ✓ | client filter on ≤16 sensors |
| `src/services/CdfTimeseriesDataService.ts` | service | OK | datapoints API | ✓ | per-series `externalId` |
| `src/services/CdfAnomalyService.ts` | service | OK | function call read | ✓ | read-only detector output |
| `src/services/mappers/cdfInstanceHelpers.ts` | mapper | OK | `instances.list` limit 100 | ✓ | |
| `src/services/mappers/gearforceMappers.ts` | mapper | OK | view → domain | ✓ extensive | resilient anomaly parsing |
| `src/viewModels/useFactoryOverviewViewModel.ts` | VM | OK | React Query | ✓ | |
| `src/viewModels/useMachineDetailViewModel.ts` | VM | OK | React Query | ✗ dedicated | covered via dashboard tests |
| `src/viewModels/useSensorDetailViewModel.ts` | VM | OK | reading + trend + anomaly | ✓ partial | |
| `src/viewModels/useAnomalyViewModel.ts` | VM | OK | trace helpers | ✓ | |
| `src/components/common/AsyncStateBoundary.tsx` | UI | OK | loading/error/empty | ✓ | |
| `src/components/layout/AppShell.tsx` | UI | OK | TopBar + panels | ✓ | |
| `src/components/layout/TopBar.tsx` | UI | OK | Aura tabs/KPIs | ✗ | |
| `src/components/dashboard/FactoryDashboard.tsx` | UI | ⚠ large | VMs + Aura | ✓ | ~560 lines; live overview + machine UX |
| `src/components/dashboard/sensorTypeMeta.tsx` | UI | OK | icons/thresholds | ✓ indirect | |
| `src/components/sensor/SensorTrendChart.tsx` | UI | OK | SVG chart | ✓ | |
| `src/components/anomaly/AnomalyPanel.tsx` | UI | OK | anomaly list/trace | ✓ | live path |
| `src/testUtils/renderWithAppServices.tsx` | test util | OK | DI harness | — | |
| `src/__mocks__/gearforceFixtures.ts` | fixtures | OK | test data | — | |

No unreachable/unused production files remain.
