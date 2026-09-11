import { CogniteClient } from '@cognite/sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { AppServicesProvider } from '@/contexts/AppServicesContext';
import { createMockServices } from '@/testUtils/renderWithAppServices';
import { useAnomalyViewModel } from '@/viewModels/useAnomalyViewModel';

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

describe(useAnomalyViewModel.name, () => {
  it('builds traceability from anomaly to machine', async () => {
    const { result } = renderHook(() => useAnomalyViewModel(), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.traces).toHaveLength(1));
    expect(result.current.traces[0].machineExternalId).toBe('gearforce.machine.L1_M1');
  });
});
