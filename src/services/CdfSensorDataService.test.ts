import type { CogniteClient } from '@cognite/sdk';
import { describe, expect, it, vi } from 'vitest';

import { mockCdfSensorNodes } from '@/__mocks__/gearforceFixtures';
import { CdfSensorDataService } from '@/services/CdfSensorDataService';

describe(CdfSensorDataService.name, () => {
  it('lists sensors for machine using relation', async () => {
    const client = {
      instances: {
        list: vi.fn().mockResolvedValue({ items: mockCdfSensorNodes }),
      },
    } as unknown as CogniteClient;

    const service = new CdfSensorDataService(client);
    const sensors = await service.listSensorsForMachine('gearforce.machine.L1_M1');

    expect(sensors).toHaveLength(1);
    expect(sensors[0].machineRef.externalId).toBe('gearforce.machine.L1_M1');
  });

  it('uses cache on subsequent listAllSensors calls', async () => {
    const list = vi.fn().mockResolvedValue({ items: mockCdfSensorNodes });
    const client = { instances: { list } } as unknown as CogniteClient;
    const service = new CdfSensorDataService(client);

    await service.listAllSensors();
    await service.listAllSensors();

    expect(list).toHaveBeenCalledTimes(1);
  });

  it('returns null for unknown sensor', async () => {
    const client = {
      instances: { list: vi.fn().mockResolvedValue({ items: mockCdfSensorNodes }) },
    } as unknown as CogniteClient;
    const service = new CdfSensorDataService(client);
    expect(await service.getSensor('missing')).toBeNull();
  });
});
