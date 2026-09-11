import type { HostAppAPI } from '@cognite/app-sdk';
import { useCallback, useState } from 'react';

import {
  DEFAULT_INVESTIGATION_STATE,
  type InvestigationState,
} from '@/types/gearforce';

function parseInvestigationState(raw: string | undefined): InvestigationState {
  if (!raw) {
    return DEFAULT_INVESTIGATION_STATE;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<InvestigationState>;
    return {
      ...DEFAULT_INVESTIGATION_STATE,
      ...parsed,
      activePanel: parsed.activePanel ?? DEFAULT_INVESTIGATION_STATE.activePanel,
    };
  } catch {
    return DEFAULT_INVESTIGATION_STATE;
  }
}

export function useInvestigationState(
  api: Pick<HostAppAPI, 'syncInternalState'> | null,
  initialState?: string,
) {
  const [state, setStateInternal] = useState<InvestigationState>(() =>
    parseInvestigationState(initialState),
  );
  const [lastInitialState, setLastInitialState] = useState(initialState);

  if (initialState !== lastInitialState) {
    setLastInitialState(initialState);
    setStateInternal(parseInvestigationState(initialState));
  }

  const setState = useCallback(
    (updater: InvestigationState | ((prev: InvestigationState) => InvestigationState)) => {
      setStateInternal((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        void api?.syncInternalState(JSON.stringify(next));
        return next;
      });
    },
    [api],
  );

  const selectLine = useCallback(
    (lineId: string) => {
      setState((prev) => ({
        ...prev,
        selectedLineId: lineId,
        selectedMachineId: undefined,
        selectedSensorId: undefined,
        activePanel: 'overview',
      }));
    },
    [setState],
  );

  const selectMachine = useCallback(
    (machineId: string, lineId?: string) => {
      setState((prev) => ({
        ...prev,
        selectedLineId: lineId ?? prev.selectedLineId,
        selectedMachineId: machineId,
        selectedSensorId: undefined,
        activePanel: 'machine',
      }));
    },
    [setState],
  );

  const selectSensor = useCallback(
    (sensorId: string) => {
      setState((prev) => ({
        ...prev,
        selectedSensorId: sensorId,
        activePanel: 'sensor',
      }));
    },
    [setState],
  );

  const showAnomalies = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activePanel: 'anomaly',
    }));
  }, [setState]);

  const goToOverview = useCallback(() => {
    setState(DEFAULT_INVESTIGATION_STATE);
  }, [setState]);

  const traceMachine = useCallback(
    (machineId: string) => {
      setState((prev) => ({
        ...prev,
        selectedMachineId: machineId,
        selectedSensorId: undefined,
        activePanel: 'machine',
      }));
    },
    [setState],
  );

  const traceSensor = useCallback(
    (sensorId: string, machineId?: string) => {
      setState((prev) => ({
        ...prev,
        selectedMachineId: machineId ?? prev.selectedMachineId,
        selectedSensorId: sensorId,
        activePanel: 'sensor',
      }));
    },
    [setState],
  );

  return {
    state,
    selectLine,
    selectMachine,
    selectSensor,
    showAnomalies,
    goToOverview,
    traceMachine,
    traceSensor,
  };
}
