import { Alert, AlertDescription } from '@cognite/aura/components/alert';
import { Button } from '@cognite/aura/components/button';
import { Loader } from '@cognite/aura/components/loader';
import type { ReactNode } from 'react';

type AsyncStateBoundaryProps = {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: ReactNode;
  loadingLabel?: string;
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

export function AsyncStateBoundary({
  isLoading,
  isError,
  error,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  onRetry,
  children,
  loadingLabel = 'Loading…',
}: AsyncStateBoundaryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-6 text-muted-foreground" aria-live="polite">
        <Loader size={20} />
        <span>{loadingLabel}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="error">
        <AlertDescription className="flex flex-col gap-3">
          <span>{errorMessage(error)}</span>
          {onRetry ? (
            <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center">
        <p className="font-medium">{emptyTitle}</p>
        {emptyDescription ? <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p> : null}
      </div>
    );
  }

  return <>{children}</>;
}
