import type { CogniteClient } from '@cognite/sdk';
import { useMemo, type ReactNode } from 'react';

import { AppServicesContext } from '@/contexts/appServicesContextValue';
import type { AppServicesFactory } from '@/contexts/appServicesTypes';
import { createDefaultAppServices } from '@/services/createDefaultAppServices';

type AppServicesProviderProps = {
  client: CogniteClient;
  children: ReactNode;
  factory?: AppServicesFactory;
};

export function AppServicesProvider({
  client,
  children,
  factory = createDefaultAppServices,
}: AppServicesProviderProps) {
  const services = useMemo(() => factory(client), [client, factory]);
  return <AppServicesContext.Provider value={services}>{children}</AppServicesContext.Provider>;
}
