import type { SensorReading, SensorTrend } from '@/types/gearforce';

export interface TimeseriesDataService {
  getLatestReading(timeseriesExternalId: string, unit: string): Promise<SensorReading | null>;
  getTrend(timeseriesExternalId: string, unit: string, windowMs: number): Promise<SensorTrend>;
}
