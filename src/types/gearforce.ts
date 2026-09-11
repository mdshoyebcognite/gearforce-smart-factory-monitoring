export type InstanceRef = {
  space: string;
  externalId: string;
};

export type FactorySummary = {
  externalId: string;
  name: string;
};

export type ProductionLineSummary = {
  externalId: string;
  name: string;
  lineId?: string;
};

export type MachineSummary = {
  externalId: string;
  name: string;
  location: string;
  lineId: string;
  status: string;
};

export type Machine = MachineSummary;

export type SensorSummary = {
  externalId: string;
  name: string;
  sensorType: string;
  unit: string;
  timeseriesExternalId: string;
  machineRef: InstanceRef;
};

export type HierarchyLine = {
  lineId: string;
  name: string;
  externalId?: string;
  machines: MachineSummary[];
};

export type FactoryOverview = {
  factory: FactorySummary | null;
  lines: HierarchyLine[];
  machines: MachineSummary[];
};

export type Datapoint = {
  timestamp: number;
  value: number;
};

export type SensorReading = {
  timeseriesExternalId: string;
  timestamp: number;
  value: number;
  unit: string;
};

export type SensorTrend = {
  timeseriesExternalId: string;
  unit: string;
  datapoints: Datapoint[];
  startMs: number;
  endMs: number;
};

export type AnomalyEntry = {
  timeseriesExternalId: string;
  sensorType: string;
  value: number;
  threshold: number;
};

export type AnomalyReport = {
  status: 'anomalies_found' | 'all_normal';
  anomalyCount: number;
  anomalies: AnomalyEntry[];
  retrievedAt: number;
};

export type InvestigationState = {
  selectedLineId?: string;
  selectedMachineId?: string;
  selectedSensorId?: string;
  activePanel: 'overview' | 'machine' | 'sensor' | 'anomaly';
};

export const DEFAULT_INVESTIGATION_STATE: InvestigationState = {
  activePanel: 'overview',
};
