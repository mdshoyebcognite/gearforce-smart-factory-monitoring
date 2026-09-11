import { describe, expect, it, vi } from 'vitest';

import { mockCdfMachineNodes } from '@/__mocks__/gearforceFixtures';
import { CdfMachineDataService } from '@/services/CdfMachineDataService';
import { createMockCogniteClient } from '@/testUtils/mockCogniteClient';

describe(CdfMachineDataService.name, () => {
  it('loads factory overview from Machine_View nodes', async () => {
    const client = createMockCogniteClient({
      instances: {
        list: vi.fn().mockImplementation(({ sources }: { sources: Array<{ source: { externalId: string } }> }) => {
          const viewId = sources[0]?.source.externalId;
          if (viewId === 'Factory_View') {
            return Promise.resolve({ items: [{ externalId: 'factory', space: 'gearforce_instances', properties: { name: 'Factory' } }] });
          }
          if (viewId === 'ProductionLine_View') {
            return Promise.resolve({ items: [] });
          }
          if (viewId === 'Machine_View') {
            return Promise.resolve({ items: mockCdfMachineNodes });
          }
          return Promise.resolve({ items: [] });
        }),
      },
    });

    const service = new CdfMachineDataService(client);
    const overview = await service.getFactoryOverview();

    expect(overview.machines).toHaveLength(2);
    expect(overview.factory?.name).toBe('Factory');
  });

  it('returns null for unknown machine', async () => {
    const client = createMockCogniteClient({
      instances: {
        list: vi.fn().mockResolvedValue({ items: [] }),
      },
    });

    const service = new CdfMachineDataService(client);
    const machine = await service.getMachine('missing');
    expect(machine).toBeNull();
  });
});
