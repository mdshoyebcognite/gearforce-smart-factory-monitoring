import type { CogniteClient } from '@cognite/sdk';

import type { MachineDataService } from '@/services/interfaces/MachineDataService';
import { listViewNodes } from '@/services/mappers/cdfInstanceHelpers';
import {
  groupMachinesByLineId,
  mapFactoryNode,
  mapMachineNode,
  mapProductionLineNode,
} from '@/services/mappers/gearforceMappers';
import type { FactoryOverview, Machine, ProductionLineSummary, FactorySummary } from '@/types/gearforce';

export class CdfMachineDataService implements MachineDataService {
  constructor(private readonly client: CogniteClient) {}

  async getFactory(): Promise<FactorySummary | null> {
    const nodes = await listViewNodes(this.client, 'factory');
    if (nodes.length === 0) {
      return null;
    }
    return mapFactoryNode(nodes[0]);
  }

  async listProductionLines(): Promise<ProductionLineSummary[]> {
    const nodes = await listViewNodes(this.client, 'productionLine');
    return nodes.map(mapProductionLineNode);
  }

  async getFactoryOverview(): Promise<FactoryOverview> {
    const [factory, lines, machineNodes] = await Promise.all([
      this.getFactory(),
      this.listProductionLines(),
      listViewNodes(this.client, 'machine'),
    ]);

    const machines = machineNodes.map(mapMachineNode);
    const groupedLines = groupMachinesByLineId(machines, lines);

    return {
      factory,
      lines: groupedLines,
      machines,
    };
  }

  async getMachine(externalId: string): Promise<Machine | null> {
    const overview = await this.getFactoryOverview();
    return overview.machines.find((m) => m.externalId === externalId) ?? null;
  }
}
