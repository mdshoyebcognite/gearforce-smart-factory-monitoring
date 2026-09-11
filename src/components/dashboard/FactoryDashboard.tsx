import { Badge } from '@cognite/aura/components/badge';
import { Button } from '@cognite/aura/components/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@cognite/aura/components/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cognite/aura/components/select';
import { Separator } from '@cognite/aura/components/separator';
import {
  IconAccessPoint,
  IconAlertTriangle,
  IconArrowLeft,
  IconBuildingFactory2,
  IconChevronDown,
  IconChevronRight,
  IconInfoCircle,
  IconSitemap,
} from '@tabler/icons-react';

import { AsyncStateBoundary } from '@/components/common/AsyncStateBoundary';
import { sensorTypeMeta } from '@/components/dashboard/sensorTypeMeta';
import { SensorTrendChart } from '@/components/sensor/SensorTrendChart';
import { ANOMALY_THRESHOLDS } from '@/config/gearforceConfig';
import { cn } from '@/lib/utils';
import type { InvestigationState, MachineSummary } from '@/types/gearforce';
import { useAnomalyViewModel } from '@/viewModels/useAnomalyViewModel';
import { useFactoryOverviewViewModel } from '@/viewModels/useFactoryOverviewViewModel';
import { useMachineDetailViewModel } from '@/viewModels/useMachineDetailViewModel';
import { useSensorDetailViewModel } from '@/viewModels/useSensorDetailViewModel';

type FactoryDashboardProps = {
  investigation: InvestigationState;
  onSelectMachine: (machineId: string, lineId: string) => void;
  onSelectSensor: (sensorId: string) => void;
  onClearSelection: () => void;
  onShowAnomalies: () => void;
};

function displayMachineLabel(machine: MachineSummary): string {
  const last = machine.externalId.split('.').pop();
  if (machine.name && !machine.name.startsWith('gearforce.')) {
    return machine.name;
  }
  return last ?? machine.externalId;
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', accent)}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-semibold leading-tight tabular-nums">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

export function FactoryDashboard({
  investigation,
  onSelectMachine,
  onSelectSensor,
  onClearSelection,
  onShowAnomalies,
}: FactoryDashboardProps) {
  const overviewVm = useFactoryOverviewViewModel();
  const anomalyVm = useAnomalyViewModel();
  const machineId = investigation.selectedMachineId;
  const sensorId = investigation.selectedSensorId;
  const machineVm = useMachineDetailViewModel(machineId);

  const machineCount = overviewVm.overview?.machines.length ?? 0;
  const lineCount = overviewVm.overview?.lines.length ?? 0;
  const sensorCount = overviewVm.overview ? 16 : 0;
  const breachCount = anomalyVm.report?.anomalyCount ?? 0;
  const anomalousMachines = overviewVm.anomalousMachineIds.size;

  const resolvedSensorId =
    sensorId ??
    (machineId
      ? (machineVm.sensors.find((s) => s.sensorType === 'temperature')?.externalId ??
        machineVm.sensors[0]?.externalId)
      : undefined);

  const sensorVm = useSensorDetailViewModel(resolvedSensorId);

  const machineHasBreach = (externalId: string) => overviewVm.anomalousMachineIds.has(externalId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Factory overview</h1>
        <p className="text-sm text-muted-foreground">
          Monitor machines across production lines and investigate threshold breaches
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Threshold breaches"
          value={String(breachCount)}
          hint={`Detected across ${anomalousMachines} machine${anomalousMachines === 1 ? '' : 's'}`}
          accent="bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300"
          icon={<IconAlertTriangle size={20} />}
        />
        <KpiCard
          label="Assets"
          value="11"
          hint={`1 factory · ${lineCount} lines · ${machineCount} machines`}
          accent="bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
          icon={<IconBuildingFactory2 size={20} />}
        />
        <KpiCard
          label="Sensors"
          value={String(sensorCount)}
          hint="Connected time series"
          accent="bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300"
          icon={<IconAccessPoint size={20} />}
        />
        <KpiCard
          label="Sensor types"
          value="3"
          hint="Temperature · Vibration · Current"
          accent="bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"
          icon={<IconSitemap size={20} />}
        />
      </div>

      {/* Production hierarchy */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Production hierarchy</h2>
            <p className="text-sm text-muted-foreground">
              Select a machine to investigate its connected sensor data
            </p>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:block">
            Factory › Line › Machine
          </span>
        </div>

        <AsyncStateBoundary
          isLoading={overviewVm.isLoading}
          isError={overviewVm.isError}
          error={overviewVm.error}
          isEmpty={!overviewVm.overview?.lines.length}
          emptyTitle="No hierarchy data"
          onRetry={overviewVm.refetch}
          loadingLabel="Loading hierarchy…"
        >
          <div className="flex flex-col gap-3">
            {overviewVm.overview?.lines.map((line) => (
              <Collapsible key={line.lineId} defaultOpen>
                <div className="rounded-lg border">
                  <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-4 py-3 text-left">
                    <span className="flex items-center gap-2 font-medium">
                      <IconSitemap size={16} className="text-muted-foreground" />
                      {line.externalId ?? line.name}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {line.machines.length} machines
                      <IconChevronDown
                        size={16}
                        className="transition-transform group-data-[panel-open]:rotate-180"
                      />
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid gap-3 border-t p-4 sm:grid-cols-2 lg:grid-cols-3">
                      {line.machines.map((machine) => {
                        const breach = machineHasBreach(machine.externalId);
                        const selected = machineId === machine.externalId;
                        return (
                          <button
                            key={machine.externalId}
                            type="button"
                            onClick={() => onSelectMachine(machine.externalId, line.lineId)}
                            className={cn(
                              'flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors hover:border-primary/50 hover:bg-muted/40',
                              selected && 'border-primary bg-primary/5 ring-1 ring-primary',
                            )}
                          >
                            <div>
                              <p className="font-semibold">{displayMachineLabel(machine)}</p>
                              <p className="text-xs text-muted-foreground">{machine.externalId}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Connected sensors</span>
                              <Badge variant={breach ? 'error' : 'success'} background>
                                {breach ? 'Threshold event' : 'Normal'}
                              </Badge>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </AsyncStateBoundary>
      </section>

      {/* Threshold events */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Threshold events</h2>
            <p className="text-sm text-muted-foreground">Detector output requiring investigation</p>
          </div>
          <span className={cn('text-sm font-semibold', breachCount > 0 ? 'text-red-600' : 'text-muted-foreground')}>
            {breachCount} total
          </span>
        </div>

        <AsyncStateBoundary
          isLoading={anomalyVm.isLoading}
          isError={anomalyVm.isError}
          error={anomalyVm.error}
          isEmpty={!anomalyVm.traces.length}
          emptyTitle="No breaches"
          emptyDescription="Latest anomaly scan reported all sensors within limits."
          onRetry={anomalyVm.refetch}
        >
          <ul className="flex flex-col gap-3">
            {anomalyVm.traces.slice(0, 4).map((trace) => {
              const meta = sensorTypeMeta(trace.anomaly.sensorType);
              return (
                <li
                  key={trace.anomaly.timeseriesExternalId}
                  className="flex flex-wrap items-center gap-3 rounded-lg border p-3"
                >
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', meta.accent)}>
                    <meta.Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Machine investigation needed</p>
                    <p className="text-xs text-muted-foreground">
                      A configured {trace.anomaly.sensorType} threshold was breached ({trace.anomaly.value}{' '}
                      &gt; {trace.anomaly.threshold}). Open the affected machine to inspect its sensor
                      time series.
                    </p>
                  </div>
                  <Badge variant="error" className="uppercase">
                    {trace.anomaly.sensorType}
                  </Badge>
                  {trace.machineExternalId ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const machine = overviewVm.overview?.machines.find(
                          (m) => m.externalId === trace.machineExternalId,
                        );
                        onSelectMachine(trace.machineExternalId!, machine?.lineId ?? '');
                      }}
                    >
                      Open investigation
                      <IconChevronRight size={14} />
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {breachCount > 0 ? (
            <button
              type="button"
              onClick={onShowAnomalies}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all {breachCount} breaches
              <IconChevronRight size={14} />
            </button>
          ) : null}
        </AsyncStateBoundary>
      </section>

      {/* Configured thresholds */}
      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Configured thresholds (from detector)</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(['temperature', 'vibration', 'current'] as const).map((key) => {
            const meta = sensorTypeMeta(key);
            const cfg = ANOMALY_THRESHOLDS[key];
            return (
              <div key={key} className="flex items-center gap-3 rounded-lg border p-3">
                <span className={cn('flex size-9 items-center justify-center rounded-lg', meta.accent)}>
                  <meta.Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium">{cfg.label}</p>
                  <p className="text-sm text-muted-foreground">
                    &gt; {cfg.limit} {cfg.unit}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <IconInfoCircle size={14} className="mt-0.5 shrink-0" />
          Threshold breaches are produced by the existing GearForce anomaly-detection workflow in
          Cognite Data Fusion. The UI presents detector results rather than recalculating anomaly
          logic in the browser.
        </p>
      </section>

      {/* Machine details */}
      {machineId && machineVm.machine ? (
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClearSelection}
                className="flex size-8 items-center justify-center rounded-md border hover:bg-muted/60"
                aria-label="Back to overview"
              >
                <IconArrowLeft size={16} />
              </button>
              <div>
                <h2 className="text-lg font-semibold">Machine details</h2>
                <p className="text-sm text-muted-foreground">Sensor and time-series investigation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{machineVm.machine.externalId}</span>
              <Button type="button" variant="secondary" size="sm" onClick={onClearSelection}>
                Close
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* left: machine info + connected sensors */}
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="mb-2 text-sm font-semibold">Machine information</h3>
                <dl className="flex flex-col gap-2 rounded-lg border p-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">External ID</dt>
                    <dd className="text-right font-medium">{machineVm.machine.externalId}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Line</dt>
                    <dd className="text-right font-medium">
                      {machineVm.machine.lineId ? `gearforce.line.${machineVm.machine.lineId}` : '—'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="flex items-center gap-2 font-medium">
                      <span
                        className={cn(
                          'size-2 rounded-full',
                          machineHasBreach(machineVm.machine.externalId)
                            ? 'bg-red-500'
                            : 'bg-emerald-500',
                        )}
                      />
                      {machineHasBreach(machineVm.machine.externalId) ? 'Threshold event' : 'Normal'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">
                  Connected sensors ({machineVm.sensors.length})
                </h3>
                {machineVm.sensors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No Sensor_View instances returned from CDF for this machine.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {machineVm.sensors.map((sensor) => {
                      const meta = sensorTypeMeta(sensor.sensorType);
                      const active = resolvedSensorId === sensor.externalId;
                      const anomaly = machineVm.machineAnomalies.find(
                        (a) => a.timeseriesExternalId === sensor.timeseriesExternalId,
                      );
                      const unit = sensor.unit || meta.unit;
                      return (
                        <li key={sensor.externalId}>
                          <button
                            type="button"
                            onClick={() => onSelectSensor(sensor.externalId)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left hover:bg-muted/50',
                              active && 'border-primary bg-primary/5',
                            )}
                          >
                            <span className={cn('flex size-8 items-center justify-center rounded-md', meta.accent)}>
                              <meta.Icon size={16} />
                            </span>
                            <span className="flex flex-1 flex-col">
                              <span className="capitalize font-medium">{sensor.sensorType}</span>
                              {anomaly ? (
                                <span className="text-xs font-medium text-red-600 tabular-nums">
                                  {anomaly.value} {unit} · threshold {anomaly.threshold} {unit}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">within threshold</span>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">{unit}</span>
                            {anomaly ? (
                              <Badge variant="error" background>
                                Breach
                              </Badge>
                            ) : (
                              <Badge variant="success" background>
                                Normal
                              </Badge>
                            )}
                            <IconChevronRight size={16} className="text-muted-foreground" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* right: sensor trend */}
            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <div>
                <h3 className="text-sm font-semibold">Sensor trend</h3>
                <p className="text-sm text-muted-foreground">
                  Select a sensor to view recent data from its time series
                </p>
              </div>

              {machineVm.sensors.length > 0 ? (
                <Select
                  value={resolvedSensorId ?? ''}
                  onValueChange={(value) => onSelectSensor(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value: string) => {
                        const match = machineVm.sensors.find((s) => s.externalId === value);
                        return match
                          ? sensorTypeMeta(match.sensorType).label
                          : 'Select a sensor';
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {machineVm.sensors.map((sensor) => (
                      <SelectItem key={sensor.externalId} value={sensor.externalId}>
                        {sensorTypeMeta(sensor.sensorType).label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}

              {resolvedSensorId && sensorVm.sensor ? (
                <div className="flex flex-col gap-2">
                  {sensorVm.sensorAnomaly ? (
                    <div>
                      <p className="text-2xl font-semibold tabular-nums text-red-600">
                        {sensorVm.sensorAnomaly.value}
                        <span className="ml-1 text-base font-normal">
                          {sensorVm.sensor.unit || sensorTypeMeta(sensorVm.sensor.sensorType).unit}
                        </span>
                      </p>
                      <p className="text-xs font-medium text-red-600">
                        Breached threshold {sensorVm.sensorAnomaly.threshold}{' '}
                        {sensorVm.sensor.unit || sensorTypeMeta(sensorVm.sensor.sensorType).unit} (anomaly detector)
                      </p>
                      {sensorVm.reading ? (
                        <p className="text-xs text-muted-foreground">
                          Latest datapoint: {sensorVm.reading.value} {sensorVm.reading.unit} (returned toward baseline)
                        </p>
                      ) : null}
                    </div>
                  ) : sensorVm.reading ? (
                    <p className="text-2xl font-semibold tabular-nums">
                      {sensorVm.reading.value}
                      <span className="ml-1 text-base font-normal text-muted-foreground">
                        {sensorVm.reading.unit}
                      </span>
                    </p>
                  ) : null}
                  {sensorVm.trend?.datapoints.length ? (
                    <SensorTrendChart
                      datapoints={sensorVm.trend.datapoints}
                      unit={sensorVm.trend.unit}
                      threshold={sensorVm.sensorAnomaly?.threshold ?? sensorTypeMeta(sensorVm.sensor.sensorType).threshold}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Loading trend data…</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Recent time-series window (24h) · {sensorVm.sensor.timeseriesExternalId}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No sensor selected.</p>
              )}
            </div>
          </div>

          <Separator className="my-5" />
          <p className="text-xs text-muted-foreground">
            Data read live from CDF views (Machine_View, Sensor_View) and classic time series.
          </p>
        </section>
      ) : null}
    </div>
  );
}
