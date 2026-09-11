import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AppShell } from '@/components/layout/AppShell';
import { renderWithAppServices } from '@/testUtils/renderWithAppServices';
import { DEFAULT_INVESTIGATION_STATE } from '@/types/gearforce';

describe(AppShell.name, () => {
  it('renders overview by default', async () => {
    renderWithAppServices(
      <AppShell
        investigation={DEFAULT_INVESTIGATION_STATE}
        onSelectMachine={vi.fn()}
        onSelectSensor={vi.fn()}
        onShowAnomalies={vi.fn()}
        onGoToOverview={vi.fn()}
        onTraceMachine={vi.fn()}
        onTraceSensor={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Production hierarchy' })).toBeInTheDocument(),
    );
  });

  it('renders machine and sensor panels when selected', async () => {
    renderWithAppServices(
      <AppShell
        investigation={{
          activePanel: 'sensor',
          selectedMachineId: 'gearforce.machine.L1_M1',
          selectedSensorId: 'gearforce.sensor.L1_M1.temp',
        }}
        onSelectMachine={vi.fn()}
        onSelectSensor={vi.fn()}
        onShowAnomalies={vi.fn()}
        onGoToOverview={vi.fn()}
        onTraceMachine={vi.fn()}
        onTraceSensor={vi.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByText('Machine details')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/Connected sensors \(/)).toBeInTheDocument());
  });

  it('shows anomaly panel when active', async () => {
    renderWithAppServices(
      <AppShell
        investigation={{ activePanel: 'anomaly' }}
        onSelectMachine={vi.fn()}
        onSelectSensor={vi.fn()}
        onShowAnomalies={vi.fn()}
        onGoToOverview={vi.fn()}
        onTraceMachine={vi.fn()}
        onTraceSensor={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Threshold-based anomalies' })).toBeInTheDocument(),
    );
  });

  it('invokes navigation callbacks', async () => {
    const onGoToOverview = vi.fn();
    const onShowAnomalies = vi.fn();

    renderWithAppServices(
      <AppShell
        investigation={DEFAULT_INVESTIGATION_STATE}
        onSelectMachine={vi.fn()}
        onSelectSensor={vi.fn()}
        onShowAnomalies={onShowAnomalies}
        onGoToOverview={onGoToOverview}
        onTraceMachine={vi.fn()}
        onTraceSensor={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /Anomalies/ }));
    expect(onShowAnomalies).toHaveBeenCalled();
  });
});
