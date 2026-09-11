import type { HostAppAPI, ConnectToHostAppResult } from '@cognite/app-sdk';
import { CogniteClient } from '@cognite/sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

type AppDeps = NonNullable<ComponentProps<typeof App>['deps']>;

type AppApi = Pick<HostAppAPI, 'syncInternalState'>;

function makeApi(): AppApi {
  return {
    syncInternalState: vi.fn<HostAppAPI['syncInternalState']>(() => Promise.resolve(true)),
  };
}

function makeConnectedFn(api: AppApi = makeApi()) {
  return vi.fn(() => Promise.resolve({ api }));
}

function makeDeps(): AppDeps {
  return {
    connectToHostApp: vi.fn<AppDeps['connectToHostApp']>(() =>
      Promise.resolve({
        api: {
          getProject: vi.fn<HostAppAPI['getProject']>(() => Promise.resolve('farhan-test')),
          getBaseUrl: vi.fn<HostAppAPI['getBaseUrl']>(() => Promise.resolve('https://cognite.test')),
          getAccessToken: vi.fn<HostAppAPI['getAccessToken']>(() => Promise.resolve('test-token')),
          getAppId: vi.fn<HostAppAPI['getAppId']>(() => Promise.resolve('test-app-id')),
        } as Partial<HostAppAPI> as HostAppAPI,
      }),
    ),
    createClient: vi.fn<AppDeps['createClient']>((config) => new CogniteClient(config)),
  };
}

function makeLoadingDeps(): AppDeps {
  return {
    connectToHostApp: vi.fn<AppDeps['connectToHostApp']>(() => new Promise<ConnectToHostAppResult>(() => undefined)),
    createClient: vi.fn<AppDeps['createClient']>((config) => new CogniteClient(config)),
  };
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    render(
      <App deps={makeLoadingDeps()} connectToHostApp={() => new Promise<never>(() => undefined)} />,
    );
    expect(screen.getByText('Loading project...')).toBeInTheDocument();
  });

  it('renders GearForce shell after host connection', async () => {
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <App deps={makeDeps()} connectToHostApp={makeConnectedFn()} />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText('Smart Factory Monitoring')).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'Production hierarchy' })).toBeInTheDocument();
  });

  it('restores investigation state from host initialState', async () => {
    const api = makeApi();
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <App
          deps={makeDeps()}
          connectToHostApp={() =>
            Promise.resolve({
              api,
              initialState: JSON.stringify({
                selectedMachineId: 'gearforce.machine.L1_M1',
                activePanel: 'machine',
              }),
            })
          }
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText('Smart Factory Monitoring')).toBeInTheDocument());
  });
});
