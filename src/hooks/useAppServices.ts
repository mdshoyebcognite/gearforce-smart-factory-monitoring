import { useContext } from 'react';

import { AppServicesContext } from '@/contexts/appServicesContextValue';
import type { AppServices } from '@/contexts/appServicesTypes';

export function useAppServices(): AppServices {
  const ctx = useContext(AppServicesContext);
  if (!ctx) {
    throw new Error('useAppServices must be used within AppServicesProvider');
  }
  return ctx;
}
