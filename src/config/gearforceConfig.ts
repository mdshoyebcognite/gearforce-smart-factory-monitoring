/** GearForce CDF constants — align with docs/cdf-verification.md */

export const GEARFORCE_INSTANCE_SPACE = 'gearforce_instances';
export const GEARFORCE_MODEL_SPACE = 'gearforce_model';

export const GEARFORCE_VIEWS = {
  factory: { space: GEARFORCE_MODEL_SPACE, externalId: 'Factory_View', version: 'v1' },
  productionLine: { space: GEARFORCE_MODEL_SPACE, externalId: 'ProductionLine_View', version: 'v1' },
  machine: { space: GEARFORCE_MODEL_SPACE, externalId: 'Machine_View', version: 'v1' },
  sensor: { space: GEARFORCE_MODEL_SPACE, externalId: 'Sensor_View', version: 'v1' },
} as const;

/** Matches fn_gearforce_anomaly_detector in the GearForce CDF toolkit module */
export const ANOMALY_FUNCTION_EXTERNAL_ID = 'fn_gearforce_anomaly_detector';

export const DEFAULT_TREND_WINDOW_MS = 24 * 60 * 60 * 1000;

export const ANOMALY_THRESHOLDS = {
  temperature: { limit: 85, unit: '°C', label: 'Temperature' },
  vibration: { limit: 4.0, unit: 'mm/s', label: 'Vibration' },
  current: { limit: 17, unit: 'A', label: 'Motor current' },
} as const;
