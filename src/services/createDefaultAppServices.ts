import type { CogniteClient } from '@cognite/sdk';

import type { AppServicesFactory } from '@/contexts/appServicesTypes';
import { CdfAnomalyService } from '@/services/CdfAnomalyService';
import { CdfMachineDataService } from '@/services/CdfMachineDataService';
import { CdfSensorDataService } from '@/services/CdfSensorDataService';
import { CdfTimeseriesDataService } from '@/services/CdfTimeseriesDataService';

export const createDefaultAppServices: AppServicesFactory = (client: CogniteClient) => ({
  machineDataService: new CdfMachineDataService(client),
  sensorDataService: new CdfSensorDataService(client),
  timeseriesDataService: new CdfTimeseriesDataService(client),
  anomalyService: new CdfAnomalyService(client),
});
