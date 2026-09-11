import type { CogniteClient } from '@cognite/sdk';

import type { SensorDataService } from '@/services/interfaces/SensorDataService';
import { listViewNodes } from '@/services/mappers/cdfInstanceHelpers';
import { mapSensorNode } from '@/services/mappers/gearforceMappers';
import type { SensorSummary } from '@/types/gearforce';

export class CdfSensorDataService implements SensorDataService {
  private cachedSensors: SensorSummary[] | null = null;

  constructor(private readonly client: CogniteClient) {}

  async listAllSensors(): Promise<SensorSummary[]> {
    if (this.cachedSensors) {
      return this.cachedSensors;
    }

    const nodes = await listViewNodes(this.client, 'sensor');
    const sensors = nodes
      .map(mapSensorNode)
      .filter((s): s is SensorSummary => s !== null);

    this.cachedSensors = sensors;
    return sensors;
  }

  async listSensorsForMachine(machineExternalId: string): Promise<SensorSummary[]> {
    const sensors = await this.listAllSensors();
    return sensors.filter((s) => s.machineRef.externalId === machineExternalId);
  }

  async getSensor(externalId: string): Promise<SensorSummary | null> {
    const sensors = await this.listAllSensors();
    return sensors.find((s) => s.externalId === externalId) ?? null;
  }
}
