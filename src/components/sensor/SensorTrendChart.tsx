import type { Datapoint } from '@/types/gearforce';

type SensorTrendChartProps = {
  datapoints: Datapoint[];
  unit: string;
  threshold?: number;
};

function formatTick(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function SensorTrendChart({ datapoints, unit, threshold }: SensorTrendChartProps) {
  if (datapoints.length === 0) {
    return null;
  }

  const width = 640;
  const height = 220;
  const padTop = 16;
  const padBottom = 28;
  const padLeft = 40;
  const padRight = 16;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const values = datapoints.map((d) => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values, threshold ?? -Infinity);
  const minY = Math.floor(rawMin * 0.9);
  const maxY = Math.ceil(rawMax * 1.05);
  const rangeY = maxY - minY || 1;

  const xFor = (index: number) =>
    padLeft + (index / Math.max(datapoints.length - 1, 1)) * plotW;
  const yFor = (value: number) =>
    padTop + plotH - ((value - minY) / rangeY) * plotH;

  const linePoints = datapoints.map((dp, i) => `${xFor(i)},${yFor(dp.value)}`).join(' ');
  const areaPoints = `${padLeft},${padTop + plotH} ${linePoints} ${padLeft + plotW},${padTop + plotH}`;

  const thresholdY =
    threshold !== undefined ? yFor(threshold) : null;

  const yTicks = [minY, minY + rangeY / 2, maxY];
  const xTickIdx = [
    0,
    Math.floor((datapoints.length - 1) / 2),
    datapoints.length - 1,
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-full"
        role="img"
        aria-label={`Sensor trend chart in ${unit}`}
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={padLeft}
              x2={padLeft + plotW}
              y1={yFor(tick)}
              y2={yFor(tick)}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1"
            />
            <text
              x={padLeft - 6}
              y={yFor(tick) + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {Math.round(tick)}
            </text>
          </g>
        ))}

        {xTickIdx.map((idx) => (
          <text
            key={idx}
            x={xFor(idx)}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {formatTick(datapoints[idx].timestamp)}
          </text>
        ))}

        <polygon points={areaPoints} className="text-primary" fill="url(#trend-fill)" />

        {thresholdY !== null ? (
          <line
            x1={padLeft}
            x2={padLeft + plotW}
            y1={thresholdY}
            y2={thresholdY}
            stroke="currentColor"
            strokeDasharray="4 4"
            className="text-red-500"
            strokeWidth="1.5"
          />
        ) : null}

        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={linePoints}
          className="text-primary"
        />
      </svg>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        {datapoints.length} points · unit: {unit}
        {threshold !== undefined ? ` · threshold ${threshold}${unit}` : ''}
      </figcaption>
    </figure>
  );
}
