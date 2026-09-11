import type { CogniteClient } from '@cognite/sdk';

import type { AnomalyService } from '@/services/interfaces/AnomalyService';
import type { MachineDataService } from '@/services/interfaces/MachineDataService';
import type { SensorDataService } from '@/services/interfaces/SensorDataService';
import type { TimeseriesDataService } from '@/services/interfaces/TimeseriesDataService';

export type AppServices = {
  machineDataService: MachineDataService;
  sensorDataService: SensorDataService;
  timeseriesDataService: TimeseriesDataService;
  anomalyService: AnomalyService;
};

export type AppServicesFactory = (client: CogniteClient) => AppServices;
