import { useQuery } from '@tanstack/react-query';

import { DEFAULT_TREND_WINDOW_MS } from '@/config/gearforceConfig';
import { useAppServices } from '@/hooks/useAppServices';

export function useSensorDetailViewModel(sensorExternalId: string | undefined) {
  const { sensorDataService, timeseriesDataService, anomalyService } = useAppServices();

  const sensorQuery = useQuery({
    queryKey: ['gearforce', 'sensor', sensorExternalId],
    queryFn: () => sensorDataService.getSensor(sensorExternalId ?? ''),
    enabled: Boolean(sensorExternalId),
  });

  const sensor = sensorQuery.data;

  const readingQuery = useQuery({
    queryKey: ['gearforce', 'reading', sensor?.timeseriesExternalId],
    queryFn: () =>
      timeseriesDataService.getLatestReading(
        sensor?.timeseriesExternalId ?? '',
        sensor?.unit ?? '',
      ),
    enabled: Boolean(sensor?.timeseriesExternalId),
  });

  const trendQuery = useQuery({
    queryKey: ['gearforce', 'trend', sensor?.timeseriesExternalId, DEFAULT_TREND_WINDOW_MS],
    queryFn: () =>
      timeseriesDataService.getTrend(
        sensor?.timeseriesExternalId ?? '',
        sensor?.unit ?? '',
        DEFAULT_TREND_WINDOW_MS,
      ),
    enabled: Boolean(sensor?.timeseriesExternalId),
  });

  const anomalyQuery = useQuery({
    queryKey: ['gearforce', 'anomalies'],
    queryFn: () => anomalyService.getLatestReport(),
    staleTime: 2 * 60 * 1000,
  });

  const sensorAnomaly = anomalyQuery.data?.anomalies.find(
    (a) => a.timeseriesExternalId === sensor?.timeseriesExternalId,
  );

  return {
    sensor,
    reading: readingQuery.data,
    trend: trendQuery.data,
    sensorAnomaly,
    isLoading: sensorQuery.isLoading,
    isReadingLoading: readingQuery.isLoading,
    isTrendLoading: trendQuery.isLoading,
    isError: sensorQuery.isError || readingQuery.isError || trendQuery.isError,
    error: sensorQuery.error ?? readingQuery.error ?? trendQuery.error,
    refetch: () => {
      void sensorQuery.refetch();
      void readingQuery.refetch();
      void trendQuery.refetch();
    },
  };
}
