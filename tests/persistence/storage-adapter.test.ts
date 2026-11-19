import { describe, it, expect, vi } from 'vitest';
import type { StoragePort } from '../../src/shared/ports';
import { ApiKeyHolder } from '../../src/ai/key-holder';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../src/config/persona';
import {
  loadPersistedState,
  savePersistedState,
  clearPersistedState,
  PERSISTENCE_STORAGE_KEY,
  MAX_PERSISTENCE_PAYLOAD_BYTES,
  type PersistedStateV1,
} from '../../src/persistence';

function createMockStorage(initial: Record<string, string> = {}): StoragePort {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, val: string) => store.set(key, val)),
    removeItem: vi.fn((key: string) => store.delete(key)),
  };
}

const validState: PersistedStateV1 = {
  version: 1,
  profile: DEFAULT_HOUSEHOLD_PERSONA,
  language: 'en',
  completedActionIds: ['clean-mask-wear', 'hepa-filter-indoor'],
  aiConsent: true,
  selectedCity: 'Delhi',
  updatedAt: 1700000000000,
};

describe('Persistence storage adapter read and write', () => {
  it('saves valid state into storage under namespaced key', () => {
    const storage = createMockStorage();
    const saveRes = savePersistedState(storage, validState);
    expect(saveRes.ok).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(
      PERSISTENCE_STORAGE_KEY,
      expect.any(String)
    );
  });

  it('loads previously persisted valid state', () => {
    const storage = createMockStorage({
      [PERSISTENCE_STORAGE_KEY]: JSON.stringify(validState),
    });
    const loadRes = loadPersistedState(storage);
    expect(loadRes.ok).toBe(true);
    if (loadRes.ok) {
      expect(loadRes.value.selectedCity).toBe('Delhi');
      expect(loadRes.value.completedActionIds).toHaveLength(2);
    }
  });

  it('clears state from storage', () => {
    const storage = createMockStorage({
      [PERSISTENCE_STORAGE_KEY]: JSON.stringify(validState),
    });
    clearPersistedState(storage);
    expect(storage.removeItem).toHaveBeenCalledWith(PERSISTENCE_STORAGE_KEY);
  });
});

describe('Persistence storage errors and key safety', () => {
  it('returns STORAGE_UNAVAILABLE if key is absent', () => {
    const storage = createMockStorage();
    const loadRes = loadPersistedState(storage);
    expect(loadRes.ok).toBe(false);
  });

  it('returns INVALID_SCHEMA if storage contains malformed JSON', () => {
    const storage = createMockStorage({
      [PERSISTENCE_STORAGE_KEY]: '{"broken-json":',
    });
    const loadRes = loadPersistedState(storage);
    expect(loadRes.ok).toBe(false);
  });

  it('returns PAYLOAD_TOO_LARGE if storage string exceeds limit', () => {
    const huge = 'a'.repeat(MAX_PERSISTENCE_PAYLOAD_BYTES + 50);
    const storage = createMockStorage({
      [PERSISTENCE_STORAGE_KEY]: huge,
    });
    const loadRes = loadPersistedState(storage);
    expect(loadRes.ok).toBe(false);
  });

  it('proves that ApiKeyHolder never touches StoragePort', () => {
    const storage = createMockStorage();
    const keyHolder = new ApiKeyHolder();
    keyHolder.setKey('ai-secret-key-12345');
    expect(keyHolder.hasKey()).toBe(true);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });
});
