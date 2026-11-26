import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { browserStoragePort } from '../../src/shared/browser-storage';
import type { StoragePort } from '../../src/shared/ports';
import {
  loadPersistedState,
  savePersistedState,
  PERSISTENCE_STORAGE_KEY,
  MAX_PERSISTENCE_PAYLOAD_BYTES,
  type PersistedStateV1,
} from '../../src/persistence';
import { useAppStore } from '../../src/app/store';
import { initStorageSync } from '../../src/app/storage-sync';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../src/config/persona';
import { PRESETS } from '../../src/config';
import { importProfileJson } from '../../src/exports';

function makeStorage(initial: Record<string, string> = {}): StoragePort {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: vi.fn((k: string) => map.get(k) ?? null),
    setItem: vi.fn((k: string, v: string) => map.set(k, v)),
    removeItem: vi.fn((k: string) => map.delete(k)),
  };
}

const sampleState: PersistedStateV1 = {
  version: 1,
  profile: PRESETS.puneStudent,
  language: 'hi',
  completedActionIds: ['act-1'],
  aiConsent: true,
  selectedCity: 'Pune',
  updatedAt: 1700000000000,
};

const INITIAL_STORE_STATE = {
  activeTab: 'airNow' as const,
  language: 'en' as const,
  theme: 'light' as const,
  selectedCity: 'Delhi',
  profile: DEFAULT_HOUSEHOLD_PERSONA,
  activePreset: 'delhiFamily' as const,
  completedActionIds: [] as string[],
  hourlySeries: null,
  isAirDataLoading: false,
  airDataError: null,
  aiConsent: false,
  toastMessage: null,
};

beforeEach(() => {
  window.localStorage.clear();
  useAppStore.setState(INITIAL_STORE_STATE);
});

afterEach(() => vi.restoreAllMocks());

describe('browserStoragePort safety', () => {
  it('reads, writes, and removes items via window.localStorage', () => {
    browserStoragePort.setItem('cb_test', 'val1');
    expect(browserStoragePort.getItem('cb_test')).toBe('val1');
    browserStoragePort.removeItem('cb_test');
    expect(browserStoragePort.getItem('cb_test')).toBeNull();
  });

  it('swallows storage exceptions cleanly across get, set, and remove', () => {
    const boom = (msg: string) => () => {
      throw new Error(msg);
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(boom('Blocked'));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(boom('Quota'));
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(boom('Deny'));

    expect(browserStoragePort.getItem('k')).toBeNull();
    expect(() => browserStoragePort.setItem('k', 'v')).not.toThrow();
    expect(() => browserStoragePort.removeItem('k')).not.toThrow();
  });
});

describe('persistence adapter and storage sync edge cases', () => {
  it('rejects non-object JSON, oversized saves, and setItem throws', () => {
    const nullLoad = loadPersistedState(
      makeStorage({ [PERSISTENCE_STORAGE_KEY]: 'null' })
    );
    expect(nullLoad.ok).toBe(false);
    if (!nullLoad.ok) expect(nullLoad.error.code).toBe('INVALID_SCHEMA');

    const hugeState: PersistedStateV1 = {
      ...sampleState,
      completedActionIds: ['x'.repeat(MAX_PERSISTENCE_PAYLOAD_BYTES + 10)],
    };
    const bigSave = savePersistedState(makeStorage(), hugeState);
    expect(bigSave.ok).toBe(false);
    if (!bigSave.ok) expect(bigSave.error.code).toBe('PAYLOAD_TOO_LARGE');

    const throwingStorage: StoragePort = {
      getItem: () => null,
      setItem: () => {
        throw new Error('Quota');
      },
      removeItem: () => {},
    };
    const errSave = savePersistedState(throwingStorage, sampleState);
    expect(errSave.ok).toBe(false);
    if (!errSave.ok) expect(errSave.error.code).toBe('STORAGE_UNAVAILABLE');
  });

  it('hydrates store from valid persisted state and handles MIGRATION_FAILED', () => {
    const stopValid = initStorageSync(
      makeStorage({ [PERSISTENCE_STORAGE_KEY]: JSON.stringify(sampleState) })
    );
    const hydrated = useAppStore.getState();
    expect(hydrated.language).toBe('hi');
    expect(hydrated.selectedCity).toBe('Pune');
    expect(hydrated.aiConsent).toBe(true);
    stopValid();

    const badV0 = makeStorage({
      [PERSISTENCE_STORAGE_KEY]: JSON.stringify({ version: 0, bad: true }),
    });
    const stopBad = initStorageSync(badV0);
    expect(useAppStore.getState().toastMessage).toContain('reset to default');
    stopBad();
  });
});

describe('Phase B storage-sync and member bounds', () => {
  it('toasts on PAYLOAD_TOO_LARGE, ignores non-persisted state, and enforces member bounds', () => {
    const oversized = JSON.stringify({
      ...sampleState,
      padding: 'x'.repeat(MAX_PERSISTENCE_PAYLOAD_BYTES),
    });
    const stopLarge = initStorageSync(
      makeStorage({ [PERSISTENCE_STORAGE_KEY]: oversized })
    );
    expect(useAppStore.getState().toastMessage).toContain('reset to default');
    const spyStore = makeStorage({
      [PERSISTENCE_STORAGE_KEY]: JSON.stringify(sampleState),
    });
    const stopSync = initStorageSync(spyStore);
    useAppStore.getState().setActiveTab('plan');
    useAppStore.getState().toggleTheme();
    expect(spyStore.setItem).not.toHaveBeenCalled();
    stopSync();
    stopLarge();

    const manyMembers = Array.from({ length: 21 }, (_, i) => ({
      id: `m-${i}`,
      ageGroup: 'adult' as const,
      respiratoryCondition: false,
    }));
    expect(
      importProfileJson(
        JSON.stringify({ ...DEFAULT_HOUSEHOLD_PERSONA, members: manyMembers })
      ).ok
    ).toBe(false);
  });
});

describe('useAppStore setters, presets, and toggles', () => {
  it('updates navigation, theme, air data, actions, and toast states', () => {
    const s = useAppStore.getState();
    s.setActiveTab('plan');
    s.setLanguage('hi');
    s.setSelectedCity('Mumbai');
    s.setAiConsent(true);
    s.toggleTheme();
    s.loadPreset('mumbaiSenior');
    s.setProfile(PRESETS.puneStudent);
    s.toggleActionCompleted('act-1');
    s.toggleActionCompleted('act-1');
    s.setHourlySeries({ city: 'Delhi', isSample: true, readings: [] });
    s.setAirDataLoading(true);
    s.setAirDataError('Offline');
    s.showToast('Saved');
    s.hideToast();

    const next = useAppStore.getState();
    expect(next.activeTab).toBe('plan');
    expect(next.selectedCity).toBe('Mumbai');
    expect(next.aiConsent).toBe(true);
    expect(next.theme).toBe('dark');
    expect(next.activePreset).toBe('custom');
    expect(next.completedActionIds).toEqual([]);
    expect(next.hourlySeries?.city).toBe('Delhi');
    expect(next.isAirDataLoading).toBe(true);
    expect(next.airDataError).toBe('Offline');
    expect(next.toastMessage).toBeNull();
    next.toggleTheme();
    expect(useAppStore.getState().theme).toBe('light');
  });
});
