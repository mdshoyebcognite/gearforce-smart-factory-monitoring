import { CogniteClient } from '@cognite/sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';

import {
  mockAnomalyReport,
  mockOverview,
  mockSensors,
} from '@/__mocks__/gearforceFixtures';
import { AppServicesProvider } from '@/contexts/AppServicesContext';
import type { AppServices } from '@/contexts/appServicesTypes';
import type { AnomalyService } from '@/services/interfaces/AnomalyService';
import type { MachineDataService } from '@/services/interfaces/MachineDataService';
import type { SensorDataService } from '@/services/interfaces/SensorDataService';
import type { TimeseriesDataService } from '@/services/interfaces/TimeseriesDataService';

type MockServiceOverrides = {
  machineDataService?: Partial<MachineDataService>;
  sensorDataService?: Partial<SensorDataService>;
  timeseriesDataService?: Partial<TimeseriesDataService>;
  anomalyService?: Partial<AnomalyService>;
};

export function createMockServices(overrides: MockServiceOverrides = {}): AppServices {
  const base: AppServices = {
    machineDataService: {
      getFactoryOverview: vi.fn().mockResolvedValue(mockOverview),
      getMachine: vi.fn().mockImplementation((id: string) =>
        Promise.resolve(mockOverview.machines.find((m) => m.externalId === id) ?? null),
      ),
      listProductionLines: vi.fn().mockResolvedValue(mockOverview.lines),
      getFactory: vi.fn().mockResolvedValue(mockOverview.factory),
    },
    sensorDataService: {
      listAllSensors: vi.fn().mockResolvedValue(mockSensors),
      listSensorsForMachine: vi.fn().mockImplementation((machineId: string) =>
        Promise.resolve(mockSensors.filter((s) => s.machineRef.externalId === machineId)),
      ),
      getSensor: vi.fn().mockImplementation((id: string) =>
        Promise.resolve(mockSensors.find((s) => s.externalId === id) ?? null),
      ),
    },
    timeseriesDataService: {
      getLatestReading: vi.fn().mockResolvedValue({
        timeseriesExternalId: 'gearforce.L1.M1.temperature',
        timestamp: 1000,
        value: 40,
        unit: '°C',
      }),
      getTrend: vi.fn().mockResolvedValue({
        timeseriesExternalId: 'gearforce.L1.M1.temperature',
        unit: '°C',
        datapoints: [
          { timestamp: 1, value: 40 },
          { timestamp: 2, value: 50 },
        ],
        startMs: 0,
        endMs: 1000,
      }),
    },
    anomalyService: {
      getLatestReport: vi.fn().mockResolvedValue(mockAnomalyReport),
    },
  };

  return {
    ...base,
    ...overrides,
    machineDataService: { ...base.machineDataService, ...overrides.machineDataService },
    sensorDataService: { ...base.sensorDataService, ...overrides.sensorDataService },
    timeseriesDataService: { ...base.timeseriesDataService, ...overrides.timeseriesDataService },
    anomalyService: { ...base.anomalyService, ...overrides.anomalyService },
  };
}

type Options = RenderOptions & {
  services?: MockServiceOverrides;
};

export function renderWithAppServices(ui: ReactElement, options: Options = {}) {
  const client = new CogniteClient({
    appId: 'test',
    project: 'test',
    baseUrl: 'https://test',
    oidcTokenProvider: async () => 'token',
  });
  const services = createMockServices(options.services);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AppServicesProvider client={client} factory={() => services}>
          {children}
        </AppServicesProvider>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    services,
  };
}
