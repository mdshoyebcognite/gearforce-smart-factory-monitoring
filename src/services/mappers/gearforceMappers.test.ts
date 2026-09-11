import { describe, expect, it } from 'vitest';

import {
  mockAnomalyReport,
  mockCdfMachineNodes,
  mockCdfSensorNodes,
  mockMachines,
  mockSensors,
} from '@/__mocks__/gearforceFixtures';
import {
  groupMachinesByLineId,
  machineExternalIdFromTimeseriesExternalId,
  mapAnomalyReport,
  mapMachineNode,
  mapProductionLineNode,
  mapSensorNode,
  machinesWithAnomalies,
  anomaliesForMachine,
} from '@/services/mappers/gearforceMappers';

describe('gearforceMappers', () => {
  it('uses externalId when machine name missing', () => {
    const machine = mapMachineNode({
      externalId: 'gearforce.machine.L1_M1',
      space: 'gearforce_instances',
      properties: { lineId: 'L1' },
    });
    expect(machine.name).toBe('gearforce.machine.L1_M1');
  });

  it('maps machine nodes with verified properties', () => {
    const machine = mapMachineNode(mockCdfMachineNodes[0]);
    expect(machine.externalId).toBe('gearforce.machine.L1_M1');
    expect(machine.lineId).toBe('L1');
    expect(machine.location).toBe('Line 1');
    expect(machine.status).toBe('running');
  });

  it('maps sensor nodes with machine relation', () => {
    const sensor = mapSensorNode(mockCdfSensorNodes[0]);
    expect(sensor?.timeseriesExternalId).toBe('gearforce.L1.M1.temperature');
    expect(sensor?.machineRef.externalId).toBe('gearforce.machine.L1_M1');
  });

  it('returns null for sensor without machine relation', () => {
    const sensor = mapSensorNode({
      externalId: 'orphan',
      space: 'gearforce_instances',
      properties: { timeseriesExternalId: 'ts-1' },
    });
    expect(sensor).toBeNull();
  });

  it('falls back to machine lineIds when production lines are missing', () => {
    const lines = groupMachinesByLineId(mockMachines, []);
    expect(lines).toHaveLength(2);
  });

  it('groups machines by production lines from CDF', () => {
    const lines = groupMachinesByLineId(mockMachines, [
      { externalId: 'line-L1', name: 'Production Line 1', lineId: 'L1' },
      { externalId: 'line-L2', name: 'Production Line 2', lineId: 'L2' },
    ]);
    expect(lines).toHaveLength(2);
    expect(lines[0].machines).toHaveLength(1);
    expect(lines[1].machines).toHaveLength(1);
  });

  it('maps anomaly report from detector output', () => {
    const report = mapAnomalyReport({
      status: 'anomalies_found',
      anomaly_count: 1,
      anomalies: [
        {
          timeseriesExternalId: 'gearforce.L1.M1.temperature',
          sensorType: 'temperature',
          value: 91.7,
          threshold: 85,
        },
      ],
    });
    expect(report.anomalyCount).toBe(1);
    expect(report.anomalies[0].value).toBe(91.7);
  });

  it('identifies machines with anomalies via timeseries linkage', () => {
    const ids = machinesWithAnomalies(mockMachines, mockSensors, mockAnomalyReport);
    expect(ids.has('gearforce.machine.L1_M1')).toBe(true);
    expect(ids.has('gearforce.machine.L2_M1')).toBe(false);
  });

  it('returns empty set when report is null or all normal', () => {
    expect(machinesWithAnomalies(mockMachines, mockSensors, null).size).toBe(0);
    expect(
      machinesWithAnomalies(mockMachines, mockSensors, {
        ...mockAnomalyReport,
        status: 'all_normal',
        anomalyCount: 0,
        anomalies: [],
      }).size,
    ).toBe(0);
  });

  it('maps snake_case anomaly fields', () => {
    const report = mapAnomalyReport({
      status: 'anomalies_found',
      anomaly_count: 1,
      anomalies: [
        {
          timeseries_externalId: 'ts-1',
          sensor_type: 'vibration',
          value: 5,
          threshold: 4,
        },
      ],
    });
    expect(report.anomalies[0].timeseriesExternalId).toBe('ts-1');
    expect(report.anomalies[0].sensorType).toBe('vibration');
  });

  it('extracts timeseries id and sensor type from alternate detector keys', () => {
    const report = mapAnomalyReport({
      anomalies: [
        {
          timeseries_external_id: 'gearforce.L1.M1.current',
          reading: '18.9',
          limit: '17.0',
        },
      ],
    });
    expect(report.status).toBe('anomalies_found');
    expect(report.anomalyCount).toBe(1);
    expect(report.anomalies[0].timeseriesExternalId).toBe('gearforce.L1.M1.current');
    expect(report.anomalies[0].sensorType).toBe('current');
    expect(report.anomalies[0].value).toBe(18.9);
    expect(report.anomalies[0].threshold).toBe(17);
  });

  it('scans arbitrary fields for a gearforce timeseries id', () => {
    const report = mapAnomalyReport({
      status: 'anomalies_found',
      anomalies: [
        {
          message: 'gearforce.L3.M1.vibration — 4.8 — BREACH (threshold 4.0)',
          value: 4.8,
          threshold: 4,
        },
      ],
    });
    expect(report.anomalies[0].timeseriesExternalId).toBe('gearforce.L3.M1.vibration');
    expect(report.anomalies[0].sensorType).toBe('vibration');
  });

  it('derives all breached machines from the six-anomaly detector run', () => {
    const report = mapAnomalyReport({
      status: 'anomalies_found',
      anomaly_count: 6,
      anomalies: [
        { externalId: 'gearforce.L1.M1.current', value: 18.9, threshold: 17 },
        { externalId: 'gearforce.L1.M1.temperature', value: 91.7, threshold: 85 },
        { externalId: 'gearforce.L1.M1.vibration', value: 5.1, threshold: 4 },
        { externalId: 'gearforce.L2.M1.current', value: 18.9, threshold: 17 },
        { externalId: 'gearforce.L2.M1.temperature', value: 87.2, threshold: 85 },
        { externalId: 'gearforce.L3.M1.vibration', value: 4.8, threshold: 4 },
      ],
    });
    const ids = machinesWithAnomalies([], [], report);
    expect(ids.has('gearforce.machine.L1-M1')).toBe(true);
    expect(ids.has('gearforce.machine.L2-M1')).toBe(true);
    expect(ids.has('gearforce.machine.L3-M1')).toBe(true);
    expect(ids.size).toBe(3);
  });

  it('reports all_normal when no anomalies present', () => {
    const report = mapAnomalyReport({ anomalies: [] });
    expect(report.status).toBe('all_normal');
    expect(report.anomalyCount).toBe(0);
  });

  it('maps sensor using asset relation alias', () => {
    const sensor = mapSensorNode({
      externalId: 's2',
      space: 'gearforce_instances',
      properties: {
        timeseriesExternalId: 'ts-2',
        machine: { space: 'gearforce_instances', externalId: 'm2' },
      },
    });
    expect(sensor?.machineRef.externalId).toBe('m2');
  });

  it('maps sensor using assets relation field', () => {
    const sensor = mapSensorNode({
      externalId: 's1',
      space: 'gearforce_instances',
      properties: {
        timeseriesExternalId: 'ts-1',
        sensorType: 'current',
        unit: 'A',
        assets: { space: 'gearforce_instances', externalId: 'm1' },
      },
    });
    expect(sensor?.machineRef.externalId).toBe('m1');
  });

  it('maps sensor from deployed CogniteTimeSeries shape', () => {
    const sensor = mapSensorNode({
      externalId: 'gearforce.L1.M1.temperature',
      space: 'gearforce_instances',
      properties: {
        name: 'L1-M1-TEMPERATURE',
        sensorType: 'temperature',
        sourceUnit: 'celsius',
        assets: [{ space: 'gearforce_instances', externalId: 'gearforce.machine.L1-M1' }],
      },
    });
    expect(sensor?.timeseriesExternalId).toBe('gearforce.L1.M1.temperature');
    expect(sensor?.unit).toBe('celsius');
    expect(sensor?.machineRef.externalId).toBe('gearforce.machine.L1-M1');
  });

  it('derives lineId from production line externalId', () => {
    const line = mapProductionLineNode({
      externalId: 'gearforce.line.L2',
      space: 'gearforce_instances',
      properties: { name: 'Production Line 2' },
    });
    expect(line.lineId).toBe('L2');
  });

  it('derives machine id from timeseries external id', () => {
    expect(machineExternalIdFromTimeseriesExternalId('gearforce.L1.M1.current')).toBe(
      'gearforce.machine.L1-M1',
    );
    expect(machineExternalIdFromTimeseriesExternalId('invalid')).toBeNull();
  });

  it('infers machine relation from sensor node external id', () => {
    const sensor = mapSensorNode({
      externalId: 'gearforce.L1.M1.current',
      space: 'gearforce_instances',
      properties: { sensorType: 'current', sourceUnit: 'amp' },
    });
    expect(sensor?.machineRef.externalId).toBe('gearforce.machine.L1-M1');
  });

  it('flags machines from anomalies when sensors list is empty', () => {
    const ids = machinesWithAnomalies(
      mockMachines,
      [],
      mockAnomalyReport,
    );
    expect(ids.has('gearforce.machine.L1-M1')).toBe(true);
  });

  it('filters anomalies for a machine without sensor join', () => {
    const entries = anomaliesForMachine('gearforce.machine.L1-M1', [], mockAnomalyReport);
    expect(entries).toHaveLength(1);
  });

  it('flattens nested DMS properties for sensors', () => {
    const sensor = mapSensorNode({
      externalId: 'gearforce.L1.M1.temperature',
      space: 'gearforce_instances',
      properties: {
        gearforce_model: {
          Sensor_View: {
            v1: { sensorType: 'temperature' },
          },
          cdf_cdm: {
            CogniteTimeSeries: {
              v1: {
                sourceUnit: 'celsius',
                assets: [{ space: 'gearforce_instances', externalId: 'gearforce.machine.L1-M1' }],
              },
            },
          },
        },
      },
    });
    expect(sensor?.machineRef.externalId).toBe('gearforce.machine.L1-M1');
    expect(sensor?.unit).toBe('celsius');
  });

  it('derives lineId from machine parent relation', () => {
    const machine = mapMachineNode({
      externalId: 'gearforce.machine.L1-M1',
      space: 'gearforce_instances',
      properties: {
        name: 'GEARBOX-ASSEMBLER-1',
        location: 'Floor-A',
        parent: { space: 'gearforce_instances', externalId: 'gearforce.line.L1' },
      },
    });
    expect(machine.lineId).toBe('L1');
  });
});
