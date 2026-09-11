import { AnomalyPanel } from '@/components/anomaly/AnomalyPanel';
import { FactoryDashboard } from '@/components/dashboard/FactoryDashboard';
import { TopBar } from '@/components/layout/TopBar';
import type { InvestigationState } from '@/types/gearforce';
import { useFactoryOverviewViewModel } from '@/viewModels/useFactoryOverviewViewModel';

type AppShellProps = {
  investigation: InvestigationState;
  onSelectMachine: (machineId: string, lineId: string) => void;
  onSelectSensor: (sensorId: string) => void;
  onShowAnomalies: () => void;
  onGoToOverview: () => void;
  onTraceMachine: (machineId: string) => void;
  onTraceSensor: (sensorId: string, machineId?: string) => void;
};

export function AppShell({
  investigation,
  onSelectMachine,
  onSelectSensor,
  onShowAnomalies,
  onGoToOverview,
  onTraceMachine,
  onTraceSensor,
}: AppShellProps) {
  const overviewVm = useFactoryOverviewViewModel();
  const showAnomalyPanel = investigation.activePanel === 'anomaly';

  return (
    <main className="min-h-screen bg-slate-100 text-foreground dark:bg-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <TopBar
          factoryName={overviewVm.overview?.factory?.name ?? 'gearforce.factory'}
          lineCount={overviewVm.overview?.lines.length ?? 0}
          machineCount={overviewVm.overview?.machines.length ?? 0}
          sensorCount={overviewVm.overview ? 16 : 0}
          breachCount={overviewVm.anomalyReport?.anomalyCount ?? 0}
          activeTab={showAnomalyPanel ? 'anomaly' : 'overview'}
          onSelectOverview={onGoToOverview}
          onSelectAnomalies={onShowAnomalies}
        />

        {showAnomalyPanel ? (
          <AnomalyPanel
            onTraceMachine={onTraceMachine}
            onTraceSensor={onTraceSensor}
            onBack={onGoToOverview}
          />
        ) : (
          <FactoryDashboard
            investigation={investigation}
            onSelectMachine={onSelectMachine}
            onSelectSensor={onSelectSensor}
            onClearSelection={onGoToOverview}
            onShowAnomalies={onShowAnomalies}
          />
        )}
      </div>
    </main>
  );
}
