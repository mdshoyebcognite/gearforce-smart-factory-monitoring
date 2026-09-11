import type {
  AnomalyReport,
  FactoryOverview,
  MachineSummary,
  SensorSummary,
} from '@/types/gearforce';

export const mockMachines: MachineSummary[] = [
  {
    externalId: 'gearforce.machine.L1_M1',
    name: 'L1-M1',
    location: 'Line 1',
    lineId: 'L1',
    status: 'running',
  },
  {
    externalId: 'gearforce.machine.L2_M1',
    name: 'L2-M1',
    location: 'Line 2',
    lineId: 'L2',
    status: 'running',
  },
];

export const mockSensors: SensorSummary[] = [
  {
    externalId: 'gearforce.sensor.L1_M1.temp',
    name: 'L1-M1 Temperature',
    sensorType: 'temperature',
    unit: '°C',
    timeseriesExternalId: 'gearforce.L1.M1.temperature',
    machineRef: { space: 'gearforce_instances', externalId: 'gearforce.machine.L1_M1' },
  },
  {
    externalId: 'gearforce.sensor.L2_M1.temp',
    name: 'L2-M1 Temperature',
    sensorType: 'temperature',
    unit: '°C',
    timeseriesExternalId: 'gearforce.L2.M1.temperature',
    machineRef: { space: 'gearforce_instances', externalId: 'gearforce.machine.L2_M1' },
  },
];

export const mockOverview: FactoryOverview = {
  factory: { externalId: 'gearforce.factory', name: 'GearForce Factory' },
  lines: [
    { lineId: 'L1', name: 'Production Line 1', machines: [mockMachines[0]] },
    { lineId: 'L2', name: 'Production Line 2', machines: [mockMachines[1]] },
  ],
  machines: mockMachines,
};

export const mockAnomalyReport: AnomalyReport = {
  status: 'anomalies_found',
  anomalyCount: 1,
  anomalies: [
    {
      timeseriesExternalId: 'gearforce.L1.M1.temperature',
      sensorType: 'temperature',
      value: 91.7,
      threshold: 85,
    },
  ],
  retrievedAt: 1_700_000_000_000,
};

export const mockCdfMachineNodes = mockMachines.map((m) => ({
  externalId: m.externalId,
  space: 'gearforce_instances',
  properties: {
    name: m.name,
    location: m.location,
    lineId: m.lineId,
    status: m.status,
  },
}));

export const mockCdfSensorNodes = mockSensors.map((s) => ({
  externalId: s.externalId,
  space: 'gearforce_instances',
  properties: {
    name: s.name,
    sensorType: s.sensorType,
    unit: s.unit,
    timeseriesExternalId: s.timeseriesExternalId,
    machine: s.machineRef,
  },
}));
