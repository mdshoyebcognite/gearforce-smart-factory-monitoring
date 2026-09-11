import type { SensorSummary } from '@/types/gearforce';

export interface SensorDataService {
  listSensorsForMachine(machineExternalId: string): Promise<SensorSummary[]>;
  getSensor(externalId: string): Promise<SensorSummary | null>;
  listAllSensors(): Promise<SensorSummary[]>;
}
