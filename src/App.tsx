import { connectToHostApp as connectToHostAppImpl } from '@cognite/app-sdk';
import type { HostAppAPI } from '@cognite/app-sdk';
import { CogniteSdkProvider, useCogniteSdk } from '@cognite/app-sdk/react';
import { Alert, AlertDescription } from '@cognite/aura/components/alert';
import { Card, CardContent } from '@cognite/aura/components/card';
import { Loader } from '@cognite/aura/components/loader';
import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { AppServicesProvider } from '@/contexts/AppServicesContext';
import { useInvestigationState } from '@/hooks/useInvestigationState';

type AppApi = Pick<HostAppAPI, 'syncInternalState'>;
type AppConnectResult = { api: AppApi; initialState?: string };

const loadingFallback = (
  <main className="min-h-screen bg-muted/50 text-foreground">
    <section className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center p-4 sm:p-8">
      <div className="mx-auto w-full max-w-sm">
        <Card aria-label="Loading project" aria-live="polite">
          <CardContent>
            <div className="inline-flex items-center gap-3 text-muted-foreground">
              <Loader size={20} />
              <span>Loading project...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  </main>
);

const errorFallback = (
  <main className="min-h-screen bg-muted/50 text-foreground">
    <section className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center p-4 sm:p-8">
      <div className="mx-auto w-full max-w-sm">
        <Alert>
          <AlertDescription>Failed to connect to Fusion host</AlertDescription>
        </Alert>
      </div>
    </section>
  </main>
);

type GearForceAppContentProps = {
  api: AppApi | null;
  initialState?: string;
};

function GearForceAppContent({ api, initialState }: GearForceAppContentProps) {
  const client = useCogniteSdk();
  const investigation = useInvestigationState(api, initialState);

  return (
    <AppServicesProvider client={client}>
      <AppShell
        investigation={investigation.state}
        onSelectMachine={investigation.selectMachine}
        onSelectSensor={investigation.selectSensor}
        onShowAnomalies={investigation.showAnomalies}
        onGoToOverview={investigation.goToOverview}
        onTraceMachine={investigation.traceMachine}
        onTraceSensor={(sensorId, machineId) => investigation.traceSensor(sensorId, machineId)}
      />
    </AppServicesProvider>
  );
}

type AppProps = {
  deps?: ComponentProps<typeof CogniteSdkProvider>['deps'];
  connectToHostApp?: () => Promise<AppConnectResult>;
};

function App({
  deps,
  connectToHostApp = deps?.connectToHostApp ?? connectToHostAppImpl,
}: AppProps) {
  const [connection, setConnection] = useState<AppConnectResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    void connectToHostApp().then((result) => {
      if (!cancelled) {
        setConnection(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [connectToHostApp]);

  return (
    <CogniteSdkProvider
      loadingFallback={loadingFallback}
      errorFallback={errorFallback}
      deps={deps}
    >
      <GearForceAppContent
        api={connection?.api ?? null}
        initialState={connection?.initialState}
      />
    </CogniteSdkProvider>
  );
}

export default App;
