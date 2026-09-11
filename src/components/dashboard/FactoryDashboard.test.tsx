import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FactoryDashboard } from '@/components/dashboard/FactoryDashboard';
import { renderWithAppServices } from '@/testUtils/renderWithAppServices';
import { DEFAULT_INVESTIGATION_STATE } from '@/types/gearforce';

describe(FactoryDashboard.name, () => {
  it('renders dashboard metrics and hierarchy', async () => {
    renderWithAppServices(
      <FactoryDashboard
        investigation={DEFAULT_INVESTIGATION_STATE}
        onSelectMachine={vi.fn()}
        onSelectSensor={vi.fn()}
        onClearSelection={vi.fn()}
        onShowAnomalies={vi.fn()}
      />,
    );

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Production hierarchy' })).toBeInTheDocument(),
    );
    expect(screen.getByText('Threshold breaches')).toBeInTheDocument();
    expect(screen.getByText('Threshold events')).toBeInTheDocument();
  });

  it('shows machine investigation when a machine is selected', async () => {
    renderWithAppServices(
      <FactoryDashboard
        investigation={{
          activePanel: 'machine',
          selectedMachineId: 'gearforce.machine.L1_M1',
        }}
        onSelectMachine={vi.fn()}
        onSelectSensor={vi.fn()}
        onClearSelection={vi.fn()}
        onShowAnomalies={vi.fn()}
      />,
    );

    await waitFor(() => expect(screen.getByText('Machine details')).toBeInTheDocument());
    expect(screen.getByText(/Connected sensors \(/)).toBeInTheDocument();
  });

  it('marks machines with threshold events from anomaly report', async () => {
    const onSelectMachine = vi.fn();
    renderWithAppServices(
      <FactoryDashboard
        investigation={DEFAULT_INVESTIGATION_STATE}
        onSelectMachine={onSelectMachine}
        onSelectSensor={vi.fn()}
        onClearSelection={vi.fn()}
        onShowAnomalies={vi.fn()}
      />,
    );

    await waitFor(() => expect(screen.getAllByText('Threshold event').length).toBeGreaterThan(0));
    await userEvent.click(screen.getByRole('button', { name: /L1-M1/i }));
    expect(onSelectMachine).toHaveBeenCalled();
  });
});
