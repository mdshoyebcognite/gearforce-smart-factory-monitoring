import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useAppServices } from '@/hooks/useAppServices';
import { machineExternalIdFromTimeseriesExternalId } from '@/services/mappers/gearforceMappers';
import type { AnomalyEntry, SensorSummary } from '@/types/gearforce';

export type AnomalyTrace = {
  anomaly: AnomalyEntry;
  sensor: SensorSummary | null;
  machineExternalId: string | null;
};

export function useAnomalyViewModel() {
  const { anomalyService, sensorDataService } = useAppServices();

  const anomalyQuery = useQuery({
    queryKey: ['gearforce', 'anomalies'],
    queryFn: () => anomalyService.getLatestReport(),
    staleTime: 2 * 60 * 1000,
  });

  const sensorsQuery = useQuery({
    queryKey: ['gearforce', 'sensors'],
    queryFn: () => sensorDataService.listAllSensors(),
  });

  const traces: AnomalyTrace[] = useMemo(() => {
    const sensors = sensorsQuery.data ?? [];
    const anomalies = anomalyQuery.data?.anomalies ?? [];

    return anomalies.map((anomaly) => {
      const sensor =
        sensors.find((s) => s.timeseriesExternalId === anomaly.timeseriesExternalId) ?? null;
      return {
        anomaly,
        sensor,
        machineExternalId:
          sensor?.machineRef.externalId ??
          machineExternalIdFromTimeseriesExternalId(anomaly.timeseriesExternalId),
      };
    });
  }, [anomalyQuery.data, sensorsQuery.data]);

  return {
    report: anomalyQuery.data,
    traces,
    isLoading: anomalyQuery.isLoading || sensorsQuery.isLoading,
    isError: anomalyQuery.isError || sensorsQuery.isError,
    error: anomalyQuery.error ?? sensorsQuery.error,
    refetch: () => {
      void anomalyQuery.refetch();
      void sensorsQuery.refetch();
    },
  };
}
