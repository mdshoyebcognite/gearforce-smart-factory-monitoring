import type { CogniteClient } from '@cognite/sdk';
import { describe, expect, it, vi } from 'vitest';

import { CdfAnomalyService } from '@/services/CdfAnomalyService';

describe(CdfAnomalyService.name, () => {
  it('reads latest completed call without invoking function', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: { items: [{ id: 99, externalId: 'fn_gearforce_anomaly_detector' }] },
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            { id: 1, status: 'Completed', startTime: 2000 },
            { id: 2, status: 'Running', startTime: 3000 },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: {
          response: {
            status: 'all_normal',
            anomaly_count: 0,
            anomalies: [],
          },
        },
      });

    const client = {
      project: 'test-project',
      get,
    } as unknown as CogniteClient;

    const service = new CdfAnomalyService(client);
    const report = await service.getLatestReport();

    expect(report?.status).toBe('all_normal');
    expect(get).toHaveBeenCalledTimes(3);
    expect(get.mock.calls[1][0]).toContain('/calls');
    expect(get.mock.calls[2][0]).toContain('/response');
  });

  it('returns null when no completed calls exist', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        data: { items: [{ id: 99, externalId: 'fn_gearforce_anomaly_detector' }] },
      })
      .mockResolvedValueOnce({
        data: { items: [{ id: 1, status: 'Running', startTime: 3000 }] },
      });

    const client = {
      project: 'test-project',
      get,
    } as unknown as CogniteClient;

    const service = new CdfAnomalyService(client);
    const report = await service.getLatestReport();
    expect(report).toBeNull();
  });

  it('returns null when function not found', async () => {
    const client = {
      project: 'test-project',
      get: vi.fn().mockResolvedValue({ data: { items: [] } }),
    } as unknown as CogniteClient;

    const service = new CdfAnomalyService(client);
    const report = await service.getLatestReport();
    expect(report).toBeNull();
  });
});
