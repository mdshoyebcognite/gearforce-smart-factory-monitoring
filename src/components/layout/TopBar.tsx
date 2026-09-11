import { Avatar, AvatarFallback } from '@cognite/aura/components/avatar';
import { Badge } from '@cognite/aura/components/badge';
import { IconAlertTriangle, IconLayoutGrid, IconSettingsBolt } from '@tabler/icons-react';

import { cn } from '@/lib/utils';

type TopBarProps = {
  factoryName: string;
  lineCount: number;
  machineCount: number;
  sensorCount: number;
  breachCount: number;
  activeTab: 'overview' | 'anomaly';
  onSelectOverview: () => void;
  onSelectAnomalies: () => void;
};

export function TopBar({
  factoryName,
  lineCount,
  machineCount,
  sensorCount,
  breachCount,
  activeTab,
  onSelectOverview,
  onSelectAnomalies,
}: TopBarProps) {
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-2 border-b bg-card/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconSettingsBolt size={20} />
          </span>
          <div className="leading-tight">
            <p className="text-xs font-medium text-muted-foreground">GearForce</p>
            <p className="text-sm font-semibold">Smart Factory Monitoring</p>
          </div>
        </div>

        <div className="hidden text-center text-xs text-muted-foreground sm:block">
          <p className="font-medium text-foreground">{factoryName}</p>
          <p>
            1 factory · {lineCount} lines · {machineCount} machines · {sensorCount} sensors
          </p>
        </div>

        <Avatar sizes="default">
          <AvatarFallback>GF</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex items-center gap-2 pb-3">
        <button
          type="button"
          onClick={onSelectOverview}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
            activeTab === 'overview'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-transparent text-muted-foreground hover:bg-muted/60',
          )}
        >
          <IconLayoutGrid size={16} />
          Factory overview
        </button>
        <button
          type="button"
          onClick={onSelectAnomalies}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
            activeTab === 'anomaly'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-transparent text-muted-foreground hover:bg-muted/60',
          )}
        >
          <IconAlertTriangle size={16} />
          Anomalies
          {breachCount > 0 ? (
            <Badge variant="error" background className="ml-1">
              {breachCount}
            </Badge>
          ) : null}
        </button>
      </div>
    </div>
  );
}
