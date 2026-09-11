import { describe, expect, it, vi } from 'vitest';

import { CdfTimeseriesDataService } from '@/services/CdfTimeseriesDataService';
import { createMockCogniteClient } from '@/testUtils/mockCogniteClient';

describe(CdfTimeseriesDataService.name, () => {
  it('retrieves latest reading from classic timeseries', async () => {
    const client = createMockCogniteClient({
      datapoints: {
        retrieveLatest: vi.fn().mockResolvedValue([
          {
            externalId: 'gearforce.L1.M1.temperature',
            datapoints: [{ timestamp: 1000, value: 42 }],
          },
        ]),
      },
    });

    const service = new CdfTimeseriesDataService(client);
    const reading = await service.getLatestReading('gearforce.L1.M1.temperature', '°C');

    expect(reading?.value).toBe(42);
    expect(client.datapoints.retrieveLatest).toHaveBeenCalledWith(
      [{ externalId: 'gearforce.L1.M1.temperature' }],
      { ignoreUnknownIds: true },
    );
  });

  it('uses bounded window for trends', async () => {
    const retrieve = vi.fn().mockResolvedValue([
      {
        externalId: 'gearforce.L1.M1.temperature',
        datapoints: [{ timestamp: 1000, value: 40 }],
      },
    ]);

    const client = createMockCogniteClient({
      datapoints: { retrieve },
    });

    const service = new CdfTimeseriesDataService(client);
    const windowMs = 3600_000;
    const trend = await service.getTrend('gearforce.L1.M1.temperature', '°C', windowMs);

    expect(trend.datapoints).toHaveLength(1);
    expect(retrieve).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ externalId: 'gearforce.L1.M1.temperature' }],
        limit: 1000,
      }),
    );
    expect(trend.endMs - trend.startMs).toBe(windowMs);
  });

  it('converts Date timestamps to epoch milliseconds', async () => {
    const client = createMockCogniteClient({
      datapoints: {
        retrieve: vi.fn().mockResolvedValue([
          {
            externalId: 'ts',
            datapoints: [
              { timestamp: new Date(1000), value: 10 },
              { timestamp: new Date(2000), value: 20 },
            ],
          },
        ]),
      },
    });

    const service = new CdfTimeseriesDataService(client);
    const trend = await service.getTrend('ts', '°C', 3600000);
    expect(trend.datapoints[0].timestamp).toBe(1000);
  });

  it('returns null when latest value is not numeric', async () => {
    const client = createMockCogniteClient({
      datapoints: {
        retrieveLatest: vi.fn().mockResolvedValue([
          { externalId: 'ts', datapoints: [{ timestamp: 1, value: 'bad' }] },
        ]),
      },
    });

    const service = new CdfTimeseriesDataService(client);
    expect(await service.getLatestReading('ts', '°C')).toBeNull();
  });
});
