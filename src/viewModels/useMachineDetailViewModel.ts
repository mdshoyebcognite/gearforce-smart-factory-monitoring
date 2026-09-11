import { useQuery } from '@tanstack/react-query';

import { DEFAULT_TREND_WINDOW_MS } from '@/config/gearforceConfig';
import { useAppServices } from '@/hooks/useAppServices';
import { anomaliesForMachine } from '@/services/mappers/gearforceMappers';

export function useMachineDetailViewModel(machineExternalId: string | undefined) {
  const { machineDataService, sensorDataService, anomalyService } = useAppServices();

  const machineQuery = useQuery({
    queryKey: ['gearforce', 'machine', machineExternalId],
    queryFn: () => machineDataService.getMachine(machineExternalId ?? ''),
    enabled: Boolean(machineExternalId),
  });

  const sensorsQuery = useQuery({
    queryKey: ['gearforce', 'machine-sensors', machineExternalId],
    queryFn: () => sensorDataService.listSensorsForMachine(machineExternalId ?? ''),
    enabled: Boolean(machineExternalId),
  });

  const anomalyQuery = useQuery({
    queryKey: ['gearforce', 'anomalies'],
    queryFn: () => anomalyService.getLatestReport(),
    staleTime: 2 * 60 * 1000,
  });

  const machineAnomalies = anomaliesForMachine(
    machineExternalId ?? '',
    sensorsQuery.data ?? [],
    anomalyQuery.data ?? null,
  );

  return {
    machine: machineQuery.data,
    sensors: sensorsQuery.data ?? [],
    isLoading: machineQuery.isLoading || sensorsQuery.isLoading,
    isError: machineQuery.isError || sensorsQuery.isError,
    error: machineQuery.error ?? sensorsQuery.error,
    machineAnomalies,
    anomalyReport: anomalyQuery.data,
    trendWindowMs: DEFAULT_TREND_WINDOW_MS,
    refetch: () => {
      void machineQuery.refetch();
      void sensorsQuery.refetch();
    },
  };
}
