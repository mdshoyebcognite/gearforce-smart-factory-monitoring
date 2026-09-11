import type { AnomalyReport } from '@/types/gearforce';

export interface AnomalyService {
  getLatestReport(): Promise<AnomalyReport | null>;
}
