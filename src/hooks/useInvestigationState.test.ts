import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useInvestigationState } from '@/hooks/useInvestigationState';

describe(useInvestigationState.name, () => {
  it('selects machine and syncs host state', () => {
    const syncInternalState = vi.fn(() => Promise.resolve(true));
    const { result } = renderHook(() =>
      useInvestigationState({ syncInternalState }),
    );

    act(() => {
      result.current.selectMachine('machine-1', 'L1');
    });

    expect(result.current.state.selectedMachineId).toBe('machine-1');
    expect(result.current.state.activePanel).toBe('machine');
    expect(syncInternalState).toHaveBeenCalled();
  });

  it('selects sensor and shows anomaly panel', () => {
    const { result } = renderHook(() => useInvestigationState(null));

    act(() => {
      result.current.selectMachine('machine-1', 'L1');
      result.current.selectSensor('sensor-1');
      result.current.showAnomalies();
    });

    expect(result.current.state.selectedSensorId).toBe('sensor-1');
    expect(result.current.state.activePanel).toBe('anomaly');
  });

  it('traces machine and sensor from anomaly flow', () => {
    const { result } = renderHook(() => useInvestigationState(null));

    act(() => {
      result.current.traceMachine('machine-2');
      result.current.traceSensor('sensor-2', 'machine-2');
    });

    expect(result.current.state.selectedMachineId).toBe('machine-2');
    expect(result.current.state.selectedSensorId).toBe('sensor-2');
    expect(result.current.state.activePanel).toBe('sensor');
  });

  it('syncs when initialState arrives after mount', () => {
    const { result, rerender } = renderHook(
      ({ initial }: { initial?: string }) => useInvestigationState(null, initial),
      { initialProps: { initial: undefined as string | undefined } },
    );

    expect(result.current.state.activePanel).toBe('overview');

    rerender({
      initial: JSON.stringify({
        selectedMachineId: 'machine-3',
        activePanel: 'machine',
      }),
    });

    expect(result.current.state.selectedMachineId).toBe('machine-3');
  });

  it('restores state from initialState', () => {
    const initial = JSON.stringify({
      selectedMachineId: 'machine-2',
      activePanel: 'machine',
    });
    const { result } = renderHook(() =>
      useInvestigationState(null, initial),
    );

    expect(result.current.state.selectedMachineId).toBe('machine-2');
  });

  it('resets to overview', () => {
    const { result } = renderHook(() => useInvestigationState(null));

    act(() => {
      result.current.selectMachine('machine-1', 'L1');
      result.current.goToOverview();
    });

    expect(result.current.state.selectedMachineId).toBeUndefined();
    expect(result.current.state.activePanel).toBe('overview');
  });

  it('falls back when initial state is invalid json', () => {
    const { result } = renderHook(() => useInvestigationState(null, '{bad'));
    expect(result.current.state.activePanel).toBe('overview');
  });

  it('selects production line', () => {
    const { result } = renderHook(() => useInvestigationState(null));

    act(() => {
      result.current.selectLine('L2');
    });

    expect(result.current.state.selectedLineId).toBe('L2');
    expect(result.current.state.activePanel).toBe('overview');
  });
});
