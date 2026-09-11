import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AsyncStateBoundary } from '@/components/common/AsyncStateBoundary';

describe(AsyncStateBoundary.name, () => {
  it('shows loading state', () => {
    render(
      <AsyncStateBoundary isLoading isError={false} emptyTitle="Empty">
        <div>Content</div>
      </AsyncStateBoundary>,
    );
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(
      <AsyncStateBoundary isLoading={false} isError={false} isEmpty emptyTitle="No data">
        <div>Content</div>
      </AsyncStateBoundary>,
    );
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('shows error with retry', async () => {
    const onRetry = vi.fn();
    render(
      <AsyncStateBoundary
        isLoading={false}
        isError
        error={new Error('Failed')}
        emptyTitle="Empty"
        onRetry={onRetry}
      >
        <div>Content</div>
      </AsyncStateBoundary>,
    );
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('shows generic error for unknown errors', () => {
    render(
      <AsyncStateBoundary isLoading={false} isError error="bad" emptyTitle="Empty">
        <div>Content</div>
      </AsyncStateBoundary>,
    );
    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument();
  });
});
