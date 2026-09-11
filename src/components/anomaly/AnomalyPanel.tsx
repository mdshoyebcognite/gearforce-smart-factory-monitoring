import { Badge } from '@cognite/aura/components/badge';
import { Button } from '@cognite/aura/components/button';
import { IconArrowLeft, IconChevronRight } from '@tabler/icons-react';

import { AsyncStateBoundary } from '@/components/common/AsyncStateBoundary';
import { sensorTypeMeta } from '@/components/dashboard/sensorTypeMeta';
import { ANOMALY_THRESHOLDS } from '@/config/gearforceConfig';
import { cn } from '@/lib/utils';
import { useAnomalyViewModel } from '@/viewModels/useAnomalyViewModel';

type AnomalyPanelProps = {
  onTraceMachine: (machineExternalId: string) => void;
  onTraceSensor: (sensorExternalId: string, machineExternalId?: string) => void;
  onBack?: () => void;
};

export function AnomalyPanel({ onTraceMachine, onTraceSensor, onBack }: AnomalyPanelProps) {
  const vm = useAnomalyViewModel();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="flex size-8 items-center justify-center rounded-md border hover:bg-muted/60"
                aria-label="Back to overview"
              >
                <IconArrowLeft size={16} />
              </button>
            ) : null}
            <div>
              <h2 className="text-lg font-semibold">Threshold-based anomalies</h2>
              <p className="text-sm text-muted-foreground">
                Results from the existing GearForce anomaly detector (not ML prediction)
              </p>
            </div>
          </div>
          {vm.report ? (
            <Badge variant={vm.report.status === 'anomalies_found' ? 'error' : 'success'} background>
              {vm.report.status === 'anomalies_found'
                ? `${vm.report.anomalyCount} breach${vm.report.anomalyCount === 1 ? '' : 'es'}`
                : 'All normal'}
            </Badge>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>Temperature &gt; {ANOMALY_THRESHOLDS.temperature.limit}{ANOMALY_THRESHOLDS.temperature.unit}</span>
          <span>·</span>
          <span>Vibration &gt; {ANOMALY_THRESHOLDS.vibration.limit}{ANOMALY_THRESHOLDS.vibration.unit}</span>
          <span>·</span>
          <span>Current &gt; {ANOMALY_THRESHOLDS.current.limit}{ANOMALY_THRESHOLDS.current.unit}</span>
        </div>
      </section>

      <AsyncStateBoundary
        isLoading={vm.isLoading}
        isError={vm.isError}
        error={vm.error}
        isEmpty={!vm.report}
        emptyTitle="Anomaly results unavailable"
        emptyDescription="Could not retrieve the latest detector call result. Verify function external ID and permissions."
        onRetry={vm.refetch}
        loadingLabel="Loading anomaly report…"
      >
        {vm.report && vm.traces.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {vm.traces.map((trace) => {
              const meta = sensorTypeMeta(trace.anomaly.sensorType);
              return (
                <li
                  key={trace.anomaly.timeseriesExternalId}
                  className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"
                >
                  <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', meta.accent)}>
                    <meta.Icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium capitalize">{trace.anomaly.sensorType} breach</p>
                    <p className="text-sm text-muted-foreground">
                      Value {trace.anomaly.value} exceeded threshold {trace.anomaly.threshold} ·{' '}
                      {trace.anomaly.timeseriesExternalId}
                    </p>
                  </div>
                  {trace.sensor ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        onTraceSensor(trace.sensor!.externalId, trace.machineExternalId ?? undefined)
                      }
                    >
                      View sensor
                    </Button>
                  ) : null}
                  {trace.machineExternalId ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onTraceMachine(trace.machineExternalId ?? '')}
                    >
                      View machine
                      <IconChevronRight size={14} />
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : vm.report ? (
          <p className="rounded-xl border bg-card p-6 text-center text-muted-foreground shadow-sm">
            No threshold breaches in the latest detector run.
          </p>
        ) : null}
      </AsyncStateBoundary>
    </div>
  );
}
