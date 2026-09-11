import { z } from 'zod';

export const InstanceIdSchema = z.object({
  space: z.string(),
  externalId: z.string(),
});

export const DirectRelationSchema = z
  .object({
    space: z.string(),
    externalId: z.string(),
  })
  .passthrough();

/**
 * The CDF anomaly detector output shape is not strictly guaranteed (field names
 * vary across detector versions), so we accept any record per anomaly and extract
 * fields defensively in the mapper.
 */
export const AnomalyEntrySchema = z.record(z.string(), z.unknown());

export const AnomalyReportSchema = z
  .object({
    status: z.string().optional(),
    anomaly_count: z.number().optional(),
    anomalyCount: z.number().optional(),
    anomalies: z.array(AnomalyEntrySchema).default([]),
  })
  .passthrough();

export const FunctionListSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      externalId: z.string().optional(),
    }),
  ),
});

export const FunctionCallsListSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      status: z.string(),
      startTime: z.number().optional(),
    }),
  ),
});

export const FunctionCallResponseEnvelopeSchema = z.object({
  response: z.unknown(),
});
