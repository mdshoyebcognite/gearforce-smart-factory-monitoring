import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AnomalyPanel } from '@/components/anomaly/AnomalyPanel';
import { renderWithAppServices } from '@/testUtils/renderWithAppServices';

describe(AnomalyPanel.name, () => {
  it('renders anomaly breaches with trace actions', async () => {
    const onTraceMachine = vi.fn();
    const onTraceSensor = vi.fn();

    renderWithAppServices(
      <AnomalyPanel onTraceMachine={onTraceMachine} onTraceSensor={onTraceSensor} />,
    );

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /view machine/i })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole('button', { name: /view machine/i }));
    expect(onTraceMachine).toHaveBeenCalledWith('gearforce.machine.L1_M1');

    await userEvent.click(screen.getByRole('button', { name: /view sensor/i }));
    expect(onTraceSensor).toHaveBeenCalledWith(
      'gearforce.sensor.L1_M1.temp',
      'gearforce.machine.L1_M1',
    );
  });

  it('shows normal state when no anomalies', async () => {
    renderWithAppServices(<AnomalyPanel onTraceMachine={vi.fn()} onTraceSensor={vi.fn()} />, {
      services: {
        anomalyService: {
          getLatestReport: vi.fn().mockResolvedValue({
            status: 'all_normal',
            anomalyCount: 0,
            anomalies: [],
            retrievedAt: Date.now(),
          }),
        },
      },
    });

    await waitFor(() => expect(screen.getByText('All normal')).toBeInTheDocument());
  });
});
