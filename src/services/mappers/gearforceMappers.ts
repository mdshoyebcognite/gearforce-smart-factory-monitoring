import { z } from 'zod';

import { GEARFORCE_INSTANCE_SPACE } from '@/config/gearforceConfig';
import { AnomalyReportSchema } from '@/types/cdfSchemas';
import type {
  AnomalyEntry,
  AnomalyReport,
  FactorySummary,
  InstanceRef,
  MachineSummary,
  ProductionLineSummary,
  SensorSummary,
} from '@/types/gearforce';

type ViewProperties = Record<string, unknown>;

type CdfNodeItem = {
  externalId: string;
  space: string;
  properties?: ViewProperties;
  sources?: Array<{ properties?: ViewProperties }>;
};

function isInstanceRef(value: unknown): value is InstanceRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    'space' in value &&
    'externalId' in value &&
    typeof (value as InstanceRef).space === 'string' &&
    typeof (value as InstanceRef).externalId === 'string'
  );
}

/** Flattens nested DMS property bags (space → view → version → fields). */
function flattenDmsProperties(input: unknown, out: ViewProperties = {}): ViewProperties {
  if (input === null || input === undefined) {
    return out;
  }
  if (isInstanceRef(input)) {
    return out;
  }
  if (Array.isArray(input)) {
    return out;
  }
  if (typeof input !== 'object') {
    return out;
  }

  const obj = input as Record<string, unknown>;
  for (const [key, val] of Object.entries(obj)) {
    if (
      val === null ||
      typeof val === 'string' ||
      typeof val === 'number' ||
      typeof val === 'boolean'
    ) {
      out[key] = val;
    } else if (Array.isArray(val)) {
      out[key] = val;
    } else if (isInstanceRef(val)) {
      out[key] = val;
    } else if (val && typeof val === 'object') {
      flattenDmsProperties(val, out);
    }
  }
  return out;
}

function mergedProperties(node: CdfNodeItem): ViewProperties {
  const result: ViewProperties = {};
  flattenDmsProperties(node.properties, result);
  for (const source of node.sources ?? []) {
    flattenDmsProperties(source.properties, result);
  }
  return result;
}

function readString(props: ViewProperties, key: string, fallback = ''): string {
  const value = props[key];
  return typeof value === 'string' ? value : fallback;
}

function parseInstanceRef(value: unknown): InstanceRef | null {
  if (Array.isArray(value) && value.length > 0) {
    return parseInstanceRef(value[0]);
  }
  const parsed = z
    .object({ space: z.string(), externalId: z.string() })
    .safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** gearforce.L1.M1.temperature → gearforce.machine.L1-M1 (matches detector naming). */
export function machineExternalIdFromTimeseriesExternalId(timeseriesExternalId: string): string | null {
  const parts = timeseriesExternalId.split('.');
  if (parts.length >= 4 && parts[0] === 'gearforce') {
    const line = parts[1];
    const machine = parts[2];
    return `gearforce.machine.${line}-${machine}`;
  }
  return null;
}

function machineRefFromSensorNodeExternalId(sensorExternalId: string): InstanceRef | null {
  const machineExternalId = machineExternalIdFromTimeseriesExternalId(sensorExternalId);
  if (!machineExternalId) {
    return null;
  }
  return { space: GEARFORCE_INSTANCE_SPACE, externalId: machineExternalId };
}

/** e.g. gearforce.line.L1 → L1, gearforce.machine.L1-M1 → L1 */
function extractLineIdFromExternalId(externalId: string): string {
  const last = externalId.split('.').pop() ?? '';
  if (last.includes('-')) {
    return last.split('-')[0];
  }
  return last;
}

function resolveLineId(node: CdfNodeItem, props: ViewProperties): string {
  const explicit = readString(props, 'lineId');
  if (explicit) {
    return explicit;
  }
  const parent = parseInstanceRef(props.parent);
  if (parent) {
    return extractLineIdFromExternalId(parent.externalId);
  }
  return extractLineIdFromExternalId(node.externalId);
}

export function mapMachineNode(node: CdfNodeItem): MachineSummary {
  const props = mergedProperties(node);
  const hasBreach = readString(props, 'status').toLowerCase() === 'threshold event';
  return {
    externalId: node.externalId,
    name: readString(props, 'name', node.externalId),
    location: readString(props, 'location'),
    lineId: resolveLineId(node, props),
    status: readString(props, 'status') || (hasBreach ? 'threshold event' : ''),
  };
}

export function mapFactoryNode(node: CdfNodeItem): FactorySummary {
  const props = mergedProperties(node);
  return {
    externalId: node.externalId,
    name: readString(props, 'name', node.externalId),
  };
}

export function mapProductionLineNode(node: CdfNodeItem): ProductionLineSummary {
  const props = mergedProperties(node);
  const lineId = readString(props, 'lineId') || extractLineIdFromExternalId(node.externalId);
  return {
    externalId: node.externalId,
    name: readString(props, 'name', node.externalId),
    lineId,
  };
}

export function mapSensorNode(node: CdfNodeItem): SensorSummary | null {
  const props = mergedProperties(node);
  const timeseriesExternalId = readString(props, 'timeseriesExternalId') || node.externalId;

  const machineRef =
    parseInstanceRef(props.assets) ??
    parseInstanceRef(props.machine) ??
    parseInstanceRef(props.asset) ??
    machineRefFromSensorNodeExternalId(node.externalId);

  if (!machineRef) {
    return null;
  }

  return {
    externalId: node.externalId,
    name: readString(props, 'name', node.externalId),
    sensorType: readString(props, 'sensorType'),
    unit: readString(props, 'sourceUnit') || readString(props, 'unit'),
    timeseriesExternalId,
    machineRef,
  };
}

export function groupMachinesByLineId(
  machines: MachineSummary[],
  lines: ProductionLineSummary[],
): Array<{ lineId: string; name: string; externalId?: string; machines: MachineSummary[] }> {
  if (lines.length > 0) {
    return lines
      .map((line) => {
        const lineKey = line.lineId || extractLineIdFromExternalId(line.externalId);
        return {
          lineId: lineKey,
          name: line.name || line.externalId,
          externalId: line.externalId,
          machines: machines.filter((m) => m.lineId === lineKey),
        };
      })
      .filter((group) => group.machines.length > 0);
  }

  const lineIds = new Set(machines.map((m) => m.lineId).filter(Boolean));
  const lineNameById = new Map(lines.map((l) => [l.lineId ?? l.externalId, l.name]));

  return [...lineIds].map((lineId) => ({
    lineId,
    name: lineNameById.get(lineId) ?? `Line ${lineId}`,
    externalId: lines.find((l) => l.lineId === lineId)?.externalId,
    machines: machines.filter((m) => m.lineId === lineId),
  }));
}

type RawAnomaly = Record<string, unknown>;

const TIMESERIES_KEYS = [
  'timeseriesExternalId',
  'timeseries_externalId',
  'timeseries_external_id',
  'timeseriesId',
  'timeseries',
  'externalId',
  'external_id',
  'tsExternalId',
  'ts_external_id',
  'ts',
  'id',
];

const SENSOR_TYPE_KEYS = ['sensorType', 'sensor_type', 'type', 'sensor'];
const VALUE_KEYS = ['value', 'reading', 'peak', 'current_value', 'currentValue', 'actual'];
const THRESHOLD_KEYS = ['threshold', 'limit', 'thresholdValue', 'threshold_value'];

const TIMESERIES_PATTERN = /gearforce\.[A-Za-z0-9]+\.[A-Za-z0-9]+\.(temperature|vibration|current)/i;

function firstString(raw: RawAnomaly, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

function firstNumber(raw: RawAnomaly, keys: string[]): number {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return 0;
}

function extractTimeseriesExternalId(raw: RawAnomaly): string {
  const direct = firstString(raw, TIMESERIES_KEYS);
  if (direct && TIMESERIES_PATTERN.test(direct)) {
    return direct;
  }
  if (direct) {
    return direct;
  }
  // Fallback: scan every string value for something that looks like a sensor timeseries id.
  for (const value of Object.values(raw)) {
    if (typeof value === 'string') {
      const match = value.match(TIMESERIES_PATTERN);
      if (match) {
        return match[0];
      }
    }
  }
  return '';
}

function sensorTypeFromTimeseriesId(timeseriesExternalId: string): string {
  const suffix = timeseriesExternalId.split('.').pop() ?? '';
  return suffix || 'unknown';
}

function mapAnomalyEntry(raw: RawAnomaly): AnomalyEntry {
  const timeseriesExternalId = extractTimeseriesExternalId(raw);
  const sensorType =
    firstString(raw, SENSOR_TYPE_KEYS) ??
    (timeseriesExternalId ? sensorTypeFromTimeseriesId(timeseriesExternalId) : 'unknown');

  return {
    timeseriesExternalId,
    sensorType,
    value: firstNumber(raw, VALUE_KEYS),
    threshold: firstNumber(raw, THRESHOLD_KEYS),
  };
}

export function mapAnomalyReport(raw: unknown): AnomalyReport {
  const parsed = AnomalyReportSchema.parse(raw);
  const anomalies = parsed.anomalies.map((entry) => mapAnomalyEntry(entry as RawAnomaly));
  const anomalyCount = parsed.anomaly_count ?? parsed.anomalyCount ?? anomalies.length;
  const status: AnomalyReport['status'] =
    parsed.status === 'all_normal'
      ? 'all_normal'
      : anomalyCount > 0 || parsed.status === 'anomalies_found'
        ? 'anomalies_found'
        : 'all_normal';

  return {
    status,
    anomalyCount,
    anomalies,
    retrievedAt: Date.now(),
  };
}

export function machinesWithAnomalies(
  _machines: MachineSummary[],
  sensors: SensorSummary[],
  report: AnomalyReport | null,
): Set<string> {
  if (!report || report.status !== 'anomalies_found') {
    return new Set();
  }

  const anomalousTs = new Set(
    report.anomalies.map((a) => a.timeseriesExternalId).filter(Boolean),
  );
  const machineIds = new Set<string>();

  for (const sensor of sensors) {
    if (anomalousTs.has(sensor.timeseriesExternalId)) {
      machineIds.add(sensor.machineRef.externalId);
    }
  }

  for (const tsId of anomalousTs) {
    const derived = machineExternalIdFromTimeseriesExternalId(tsId);
    if (derived) {
      machineIds.add(derived);
    }
  }

  return machineIds;
}

export function anomaliesForMachine(
  machineExternalId: string,
  sensors: SensorSummary[],
  report: AnomalyReport | null,
): AnomalyEntry[] {
  if (!report) {
    return [];
  }
  const sensorTsForMachine = new Set(
    sensors
      .filter((s) => s.machineRef.externalId === machineExternalId)
      .map((s) => s.timeseriesExternalId),
  );

  return report.anomalies.filter((a) => {
    if (sensorTsForMachine.has(a.timeseriesExternalId)) {
      return true;
    }
    const derived = machineExternalIdFromTimeseriesExternalId(a.timeseriesExternalId);
    return derived === machineExternalId;
  });
}
