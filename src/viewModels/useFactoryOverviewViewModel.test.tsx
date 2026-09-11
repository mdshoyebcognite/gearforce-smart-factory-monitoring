import { CogniteClient } from '@cognite/sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { AppServicesProvider } from '@/contexts/AppServicesContext';
import { createMockServices } from '@/testUtils/renderWithAppServices';
import { useFactoryOverviewViewModel } from '@/viewModels/useFactoryOverviewViewModel';

function wrapper(services = createMockServices()) {
  const client = new CogniteClient({
    appId: 't',
    project: 't',
    baseUrl: 'https://t',
    oidcTokenProvider: async () => 't',
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AppServicesProvider client={client} factory={() => services}>
        {children}
      </AppServicesProvider>
    </QueryClientProvider>
  );
}

describe(useFactoryOverviewViewModel.name, () => {
  it('loads overview and flags anomalous machines', async () => {
    const { result } = renderHook(() => useFactoryOverviewViewModel(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.overview?.machines).toHaveLength(2));
    expect(result.current.anomalousMachineIds.has('gearforce.machine.L1_M1')).toBe(true);
  });

  it('refetches data sources', async () => {
    const services = createMockServices();
    const { result } = renderHook(() => useFactoryOverviewViewModel(), { wrapper: wrapper(services) });
    await waitFor(() => expect(result.current.overview).toBeDefined());
    result.current.refetch();
    expect(services.machineDataService.getFactoryOverview).toHaveBeenCalled();
  });
});
