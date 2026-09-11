import { createContext } from 'react';

import type { AppServices } from '@/contexts/appServicesTypes';

export const AppServicesContext = createContext<AppServices | null>(null);
