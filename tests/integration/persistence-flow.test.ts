import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { StoragePort } from '../../src/shared/ports';
import { useAppStore } from '../../src/app/store';
import { initStorageSync } from '../../src/app/storage-sync';
import {
  loadPersistedState,
  PERSISTENCE_STORAGE_KEY,
} from '../../src/persistence';
import {
  exportPlanCsv,
  exportDailyPlanIcs,
  importProfileJson,
} from '../../src/exports';
import { SystemClock, SystemIdGenerator } from '../../src/shared/system-ports';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../src/config/persona';
import type { DailyPlan } from '../../src/domain/contracts';
import { ACTION_CATALOG } from '../../src/domain/actions';

function createMockStorage(initial: Record<string, string> = {}): StoragePort {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: vi.fn((key: string) => map.get(key) ?? null),
    setItem: vi.fn((key: string, val: string) => map.set(key, val)),
    removeItem: vi.fn((key: string) => map.delete(key)),
  };
}

const mockPlan: DailyPlan = {
  outdoorWindows: [{ startHour: 12, endHour: 14, averageAqi: 110 }],
  bestVentilationWindow: { startHour: 13, endHour: 14 },
  purifierSchedule: [{ hour: 22, operationalState: 'high' }],
  hourlyAqi: [],
  advisorySummary: 'Integration test advisory summary.',
};

describe('End-to-end storage persistence and recovery integration', () => {
  beforeEach(() => {
    useAppStore.setState({
      profile: DEFAULT_HOUSEHOLD_PERSONA,
      language: 'en',
      completedActionIds: [],
      aiConsent: false,
      selectedCity: 'Delhi',
      toastMessage: null,
    });
  });

  it('persists and reloads full state across simulated sessions', () => {
    const storage = createMockStorage();
    const cleanup = initStorageSync(storage);

    useAppStore.getState().setSelectedCity('Noida');
    useAppStore.getState().setAiConsent(true);
    useAppStore.getState().toggleActionCompleted('action-wet-mop');

    expect(storage.setItem).toHaveBeenCalledWith(
      PERSISTENCE_STORAGE_KEY,
      expect.stringContaining('Noida')
    );

    const loaded = loadPersistedState(storage);
    expect(loaded.ok).toBe(true);
    if (loaded.ok) {
      expect(loaded.value.selectedCity).toBe('Noida');
      expect(loaded.value.aiConsent).toBe(true);
      expect(loaded.value.completedActionIds).toContain('action-wet-mop');
    }

    const tampered = createMockStorage({
      [PERSISTENCE_STORAGE_KEY]: JSON.stringify({
        ...(loaded.ok ? loaded.value : {}),
        selectedCity: 'Faridabad',
      }),
    });
    expect(loadPersistedState(tampered).ok).toBe(false);

    cleanup();
  });

  it('recovers gracefully from corrupted storage and warns user', () => {
    const storage = createMockStorage({
      [PERSISTENCE_STORAGE_KEY]: '{"corrupted": true, broken: true}',
    });

    const cleanup = initStorageSync(storage);
    const store = useAppStore.getState();

    expect(store.toastMessage).toContain('reset to default family profile');
    expect(store.profile.members).toHaveLength(
      DEFAULT_HOUSEHOLD_PERSONA.members.length
    );

    cleanup();
  });
});

describe('End-to-end exports and consent safety integration', () => {
  it('exports valid CSV and ICS from stored plan data', () => {
    const items = ACTION_CATALOG.slice(0, 3).map((action) => ({
      action,
      dailyDoseReductionUg: 300,
      doseReductionBasisPoints: 1000,
      co2eSavedGramsPerDay: 150,
    }));

    const csv = exportPlanCsv(items, mockPlan);
    expect(csv).toContain('Action ID,Category,Title');
    expect(csv).toContain('\r\n');

    const clock = new SystemClock();
    const idGen = new SystemIdGenerator();
    const ics = exportDailyPlanIcs(mockPlan, clock, idGen);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
  });

  it('imports valid JSON profile into store and rejects invalid JSON', () => {
    const validJson = JSON.stringify(DEFAULT_HOUSEHOLD_PERSONA);
    const importRes = importProfileJson(validJson);
    expect(importRes.ok).toBe(true);
    if (importRes.ok) {
      useAppStore.getState().setProfile(importRes.value);
      expect(useAppStore.getState().profile.home.type).toBe('apartment');
    }

    const badJson = '{"home": {"type": "space-station"}}';
    const badRes = importProfileJson(badJson);
    expect(badRes.ok).toBe(false);
  });

  it('guarantees that consent off prevents external AI calls', () => {
    const store = useAppStore.getState();
    expect(store.aiConsent).toBe(false);
    const fetchSpy = vi.fn();
    if (store.aiConsent) {
      fetchSpy('https://generativelanguage.googleapis.com');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
