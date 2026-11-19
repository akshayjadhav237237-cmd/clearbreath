import type { StoragePort } from '../shared/ports';
import type { Result } from '../shared/result';
import { ok, err } from '../shared/result';
import type { PersistedStateV1, PersistenceError } from './types';
import {
  PERSISTENCE_STORAGE_KEY,
  MAX_PERSISTENCE_PAYLOAD_BYTES,
} from './types';
import { migrateToV1 } from './migrations';

/** Loads and validates versioned application state from injected storage port. */
export function loadPersistedState(
  storage: StoragePort
): Result<PersistedStateV1, PersistenceError> {
  const rawString = storage.getItem(PERSISTENCE_STORAGE_KEY);
  if (rawString === null) {
    return err({
      code: 'STORAGE_UNAVAILABLE',
      message: 'No persisted state found in storage',
    });
  }

  if (rawString.length > MAX_PERSISTENCE_PAYLOAD_BYTES) {
    return err({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Persisted payload exceeds maximum allowed size',
    });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawString);
  } catch {
    return err({
      code: 'INVALID_SCHEMA',
      message: 'Persisted payload contains invalid JSON',
    });
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return err({
      code: 'INVALID_SCHEMA',
      message: 'Persisted payload is not an object',
    });
  }

  return migrateToV1(parsed as Record<string, unknown>);
}

/** Serializes and saves versioned application state to injected storage port. */
export function savePersistedState(
  storage: StoragePort,
  state: PersistedStateV1
): Result<void, PersistenceError> {
  const serialized = JSON.stringify(state);
  if (serialized.length > MAX_PERSISTENCE_PAYLOAD_BYTES) {
    return err({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Serialized state exceeds storage size limit',
    });
  }

  try {
    storage.setItem(PERSISTENCE_STORAGE_KEY, serialized);
    return ok(undefined);
  } catch {
    return err({
      code: 'STORAGE_UNAVAILABLE',
      message: 'Storage write failed due to quota or access restriction',
    });
  }
}

/** Removes all persisted application state from storage. */
export function clearPersistedState(storage: StoragePort): void {
  storage.removeItem(PERSISTENCE_STORAGE_KEY);
}
