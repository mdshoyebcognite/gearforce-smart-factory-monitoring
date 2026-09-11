import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useAppServices } from '@/hooks/useAppServices';
import { machinesWithAnomalies } from '@/services/mappers/gearforceMappers';

export function useFactoryOverviewViewModel() {
  const { machineDataService, sensorDataService, anomalyService } = useAppServices();

  const overviewQuery = useQuery({
    queryKey: ['gearforce', 'overview'],
    queryFn: () => machineDataService.getFactoryOverview(),
  });

  const sensorsQuery = useQuery({
    queryKey: ['gearforce', 'sensors'],
    queryFn: () => sensorDataService.listAllSensors(),
  });

  const anomalyQuery = useQuery({
    queryKey: ['gearforce', 'anomalies'],
    queryFn: () => anomalyService.getLatestReport(),
    staleTime: 2 * 60 * 1000,
  });

  const anomalousMachineIds = useMemo(() => {
    if (!overviewQuery.data || !sensorsQuery.data) {
      return new Set<string>();
    }
    return machinesWithAnomalies(
      overviewQuery.data.machines,
      sensorsQuery.data,
      anomalyQuery.data ?? null,
    );
  }, [overviewQuery.data, sensorsQuery.data, anomalyQuery.data]);

  return {
    overview: overviewQuery.data,
    isLoading: overviewQuery.isLoading || sensorsQuery.isLoading,
    isError: overviewQuery.isError || sensorsQuery.isError,
    error: overviewQuery.error ?? sensorsQuery.error,
    anomalyReport: anomalyQuery.data,
    isAnomalyLoading: anomalyQuery.isLoading,
    isAnomalyError: anomalyQuery.isError,
    anomalousMachineIds,
    refetch: () => {
      void overviewQuery.refetch();
      void sensorsQuery.refetch();
      void anomalyQuery.refetch();
    },
  };
}
