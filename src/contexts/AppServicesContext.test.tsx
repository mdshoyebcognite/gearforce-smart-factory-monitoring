import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAppServices } from '@/hooks/useAppServices';

describe('useAppServices', () => {
  it('throws outside provider', () => {
    expect(() => renderHook(() => useAppServices())).toThrow(
      'useAppServices must be used within AppServicesProvider',
    );
  });
});
