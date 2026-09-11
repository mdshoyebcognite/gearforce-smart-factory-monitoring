import type { CogniteClient } from '@cognite/sdk';

/**
 * Deep-partial that preserves function signatures so callers keep real type
 * guarantees on the methods they stub (method names and shapes are checked),
 * while only supplying the parts of the client a given test exercises.
 */
type DeepPartial<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => R
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/**
 * Builds a typed CogniteClient stub for unit tests from a partial
 * implementation. The single boundary cast lives here so individual tests
 * stay free of `as unknown as` / `any` and only declare the methods they use.
 */
export function createMockCogniteClient(partial: DeepPartial<CogniteClient>): CogniteClient {
  return partial as CogniteClient;
}
