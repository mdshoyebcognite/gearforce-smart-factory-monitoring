import type { CogniteClient } from '@cognite/sdk';

import { ANOMALY_FUNCTION_EXTERNAL_ID } from '@/config/gearforceConfig';
import type { AnomalyService } from '@/services/interfaces/AnomalyService';
import { mapAnomalyReport } from '@/services/mappers/gearforceMappers';
import {
  FunctionCallResponseEnvelopeSchema,
  FunctionCallsListSchema,
  FunctionListSchema,
} from '@/types/cdfSchemas';
import type { AnomalyReport } from '@/types/gearforce';

export class CdfAnomalyService implements AnomalyService {
  constructor(
    private readonly client: CogniteClient,
    private readonly functionExternalId: string = ANOMALY_FUNCTION_EXTERNAL_ID,
  ) {}

  async getLatestReport(): Promise<AnomalyReport | null> {
    const functionId = await this.resolveFunctionId();
    if (functionId === null) {
      return null;
    }

    const calls = await this.listCompletedCalls(functionId);
    const latestCompleted = calls.find((c) => c.status === 'Completed');
    if (!latestCompleted) {
      return null;
    }

    const response = await this.fetchCallResponse(functionId, latestCompleted.id);
    return mapAnomalyReport(response);
  }

  private async resolveFunctionId(): Promise<number | null> {
    const res = await this.client.get<{ items: unknown }>(
      `/api/v1/projects/${this.client.project}/functions`,
    );
    const parsed = FunctionListSchema.parse(res.data);
    const match = parsed.items.find((f) => f.externalId === this.functionExternalId);
    return match?.id ?? null;
  }

  private async listCompletedCalls(functionId: number) {
    const res = await this.client.get<{ items: unknown }>(
      `/api/v1/projects/${this.client.project}/functions/${functionId}/calls`,
      { params: { limit: 10 } },
    );
    const parsed = FunctionCallsListSchema.parse(res.data);
    return parsed.items.sort((a, b) => (b.startTime ?? 0) - (a.startTime ?? 0));
  }

  private async fetchCallResponse(functionId: number, callId: number): Promise<unknown> {
    const res = await this.client.get<{ response: unknown }>(
      `/api/v1/projects/${this.client.project}/functions/${functionId}/calls/${callId}/response`,
    );
    const envelope = FunctionCallResponseEnvelopeSchema.parse(res.data);
    return envelope.response;
  }
}
