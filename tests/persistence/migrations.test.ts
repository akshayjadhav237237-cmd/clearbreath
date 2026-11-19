import { describe, it, expect } from 'vitest';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../src/config/persona';
import {
  migrateToV1,
  migrateV1ToV2ForTesting,
  type PersistedStateV1,
} from '../../src/persistence';

describe('Schema migrations', () => {
  const validV1: PersistedStateV1 = {
    version: 1,
    profile: DEFAULT_HOUSEHOLD_PERSONA,
    language: 'en',
    completedActionIds: ['action-1'],
    aiConsent: true,
    selectedCity: 'Delhi',
    updatedAt: 1700000000000,
  };

  it('accepts compliant v1 state directly', () => {
    const res = migrateToV1(validV1 as unknown as Record<string, unknown>);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.version).toBe(1);
      expect(res.value.selectedCity).toBe('Delhi');
    }
  });

  it('migrates unversioned v0 state to version 1', () => {
    const legacyV0 = {
      profile: DEFAULT_HOUSEHOLD_PERSONA,
      language: 'hi',
      completedActionIds: [],
      aiConsent: 1,
      selectedCity: 'Gurugram',
    };
    const res = migrateToV1(legacyV0 as Record<string, unknown>);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.version).toBe(1);
      expect(res.value.aiConsent).toBe(true);
      expect(res.value.selectedCity).toBe('Gurugram');
      expect(typeof res.value.updatedAt).toBe('number');
    }
  });

  it('rejects completely invalid schema data', () => {
    const badData = {
      version: 1,
      profile: { notAProfile: true },
    };
    const res = migrateToV1(badData as Record<string, unknown>);
    expect(res.ok).toBe(false);
  });

  it('executes forward compatibility test migration from v1 to v2', () => {
    const v2Data = migrateV1ToV2ForTesting(validV1);
    expect(v2Data['version']).toBe(2);
    expect(v2Data['schemaRevisionNotes']).toBeDefined();
  });
});
