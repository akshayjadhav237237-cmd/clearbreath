import type { Result } from '../shared/result';
import { ok, err } from '../shared/result';
import type { PersistedStateV1, PersistenceError } from './types';
import { persistedStateV1Schema } from './types';

interface MigrationStep {
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly transform: (
    input: Record<string, unknown>
  ) => Record<string, unknown>;
}

const v0ToV1Migration: MigrationStep = {
  fromVersion: 0,
  toVersion: 1,
  transform: (input) => ({
    ...input,
    version: 1,
    aiConsent: Boolean(input['aiConsent']),
    updatedAt:
      typeof input['updatedAt'] === 'number'
        ? input['updatedAt']
        : 1700000000000,
  }),
};

const MIGRATION_REGISTRY: readonly MigrationStep[] = [v0ToV1Migration];

/** Executes sequential migrations on unversioned or legacy state objects. */
export function migrateToV1(
  raw: Record<string, unknown>
): Result<PersistedStateV1, PersistenceError> {
  let current = raw;
  const rawVersion = typeof raw['version'] === 'number' ? raw['version'] : 0;

  if (rawVersion === 1) {
    const parseRes = persistedStateV1Schema.safeParse(raw);
    if (!parseRes.success) {
      return err({
        code: 'INVALID_SCHEMA',
        message: parseRes.error.message,
      });
    }
    return ok(parseRes.data);
  }

  for (const step of MIGRATION_REGISTRY) {
    const stepVersion =
      typeof current['version'] === 'number' ? current['version'] : 0;
    if (stepVersion === step.fromVersion) {
      current = step.transform(current);
    }
  }

  const result = persistedStateV1Schema.safeParse(current);
  if (!result.success) {
    return err({
      code: 'MIGRATION_FAILED',
      message: `Failed to migrate data to schema v1: ${result.error.message}`,
    });
  }

  return ok(result.data);
}

/** Test utility migrating v1 state to a hypothetical future v2 schema. */
export function migrateV1ToV2ForTesting(
  stateV1: PersistedStateV1
): Record<string, unknown> {
  return {
    ...stateV1,
    version: 2,
    schemaRevisionNotes: 'Upgraded for testing forward compatibility',
  };
}
