import type { FactoryOverview, Machine, ProductionLineSummary, FactorySummary } from '@/types/gearforce';

export interface MachineDataService {
  getFactoryOverview(): Promise<FactoryOverview>;
  getMachine(externalId: string): Promise<Machine | null>;
  listProductionLines(): Promise<ProductionLineSummary[]>;
  getFactory(): Promise<FactorySummary | null>;
}
