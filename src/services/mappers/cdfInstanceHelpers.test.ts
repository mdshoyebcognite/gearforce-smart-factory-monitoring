import { describe, expect, it } from 'vitest';

import { isPermissionError } from '@/services/mappers/cdfInstanceHelpers';

describe('cdfInstanceHelpers', () => {
  it('detects permission errors', () => {
    expect(isPermissionError(new Error('403 Forbidden'))).toBe(true);
    expect(isPermissionError(new Error('permission denied'))).toBe(true);
    expect(isPermissionError(new Error('network'))).toBe(false);
  });
});
