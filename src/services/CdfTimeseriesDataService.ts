import type { CogniteClient, DoubleDatapoint } from '@cognite/sdk';

import type { TimeseriesDataService } from '@/services/interfaces/TimeseriesDataService';
import type { SensorReading, SensorTrend } from '@/types/gearforce';

function toEpochMs(timestamp: Date | number): number {
  return timestamp instanceof Date ? timestamp.getTime() : timestamp;
}

function isNumericDatapoint(dp: unknown): dp is DoubleDatapoint {
  return (
    typeof dp === 'object' &&
    dp !== null &&
    'value' in dp &&
    typeof (dp as DoubleDatapoint).value === 'number'
  );
}

export class CdfTimeseriesDataService implements TimeseriesDataService {
  constructor(private readonly client: CogniteClient) {}

  async getLatestReading(timeseriesExternalId: string, unit: string): Promise<SensorReading | null> {
    const results = await this.client.datapoints.retrieveLatest(
      [{ externalId: timeseriesExternalId }],
      { ignoreUnknownIds: true },
    );

    const series = results[0];
    const datapoints = series?.datapoints ?? [];
    const latest = datapoints[datapoints.length - 1];
    if (!isNumericDatapoint(latest)) {
      return null;
    }

    return {
      timeseriesExternalId,
      timestamp: toEpochMs(latest.timestamp),
      value: latest.value,
      unit,
    };
  }

  async getTrend(timeseriesExternalId: string, unit: string, windowMs: number): Promise<SensorTrend> {
    const endMs = Date.now();
    const startMs = endMs - windowMs;

    // GearForce demo datapoints are historical (Jan 2024); scan from epoch so charts populate.
    const results = await this.client.datapoints.retrieve({
      items: [{ externalId: timeseriesExternalId }],
      start: 0,
      end: endMs,
      limit: 1000,
    });

    const series = results[0];
    const datapoints =
      series?.datapoints
        ?.filter(isNumericDatapoint)
        .map((dp) => ({ timestamp: toEpochMs(dp.timestamp), value: dp.value })) ?? [];

    return {
      timeseriesExternalId,
      unit,
      datapoints,
      startMs,
      endMs,
    };
  }
}
