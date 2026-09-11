import { IconActivity, IconBolt, IconThermometer } from '@tabler/icons-react';
import type { ComponentType } from 'react';

import { ANOMALY_THRESHOLDS } from '@/config/gearforceConfig';

type SensorTypeKey = keyof typeof ANOMALY_THRESHOLDS;

type IconComponent = ComponentType<{ size?: number | string; className?: string }>;

type SensorTypeMeta = {
  label: string;
  unit: string;
  threshold: number;
  Icon: IconComponent;
  /** tailwind text + bg classes for the icon chip */
  accent: string;
};

const META: Record<SensorTypeKey, SensorTypeMeta> = {
  temperature: {
    label: 'Temperature',
    unit: '°C',
    threshold: ANOMALY_THRESHOLDS.temperature.limit,
    Icon: IconThermometer,
    accent: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300',
  },
  vibration: {
    label: 'Vibration',
    unit: 'mm/s',
    threshold: ANOMALY_THRESHOLDS.vibration.limit,
    Icon: IconActivity,
    accent: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
  },
  current: {
    label: 'Motor current',
    unit: 'A',
    threshold: ANOMALY_THRESHOLDS.current.limit,
    Icon: IconBolt,
    accent: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300',
  },
};

const FALLBACK: SensorTypeMeta = {
  label: 'Sensor',
  unit: '',
  threshold: 0,
  Icon: IconActivity,
  accent: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export function sensorTypeMeta(sensorType: string): SensorTypeMeta {
  const key = sensorType.toLowerCase() as SensorTypeKey;
  return META[key] ?? { ...FALLBACK, label: sensorType || FALLBACK.label };
}
