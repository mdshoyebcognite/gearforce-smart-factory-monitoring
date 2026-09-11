import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SensorTrendChart } from '@/components/sensor/SensorTrendChart';

describe(SensorTrendChart.name, () => {
  it('renders chart with datapoints', () => {
    render(
      <SensorTrendChart
        datapoints={[
          { timestamp: 1, value: 10 },
          { timestamp: 2, value: 20 },
        ]}
        unit="°C"
        threshold={85}
      />,
    );

    expect(screen.getByRole('img', { name: /sensor trend chart/i })).toBeInTheDocument();
    expect(screen.getByText(/2 points/)).toBeInTheDocument();
  });

  it('renders nothing when datapoints empty', () => {
    const { container } = render(<SensorTrendChart datapoints={[]} unit="°C" />);
    expect(container).toBeEmptyDOMElement();
  });
});
