import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  ActionCategory,
  CommuteMode,
} from '../../../src/domain/contracts';
import {
  ACTION_CATALOG,
  ACTION_MAP,
  ACTION_SOURCES,
  ACTION_SOURCES_MAP,
  COMMUTE_EMISSION_FACTORS,
  calculateCommuteEmissionsGrams,
  calculateModalShiftSavingsGrams,
  getActionById,
  getActionCatalog,
  getActionSourceById,
  getActionsByCategory,
  getEmissionFactorForMode,
} from '../../../src/domain/actions';

const catalog = getActionCatalog();

describe('Domain Actions Catalog inventory and quotas', () => {
  it('contains between 24 and 30 total actions', () => {
    expect(catalog.length).toBeGreaterThanOrEqual(24);
    expect(catalog.length).toBeLessThanOrEqual(30);
  });

  it('fulfills minimum quota across all five categories', () => {
    const categories: ActionCategory[] = [
      'indoor',
      'mobility',
      'outdoor',
      'household',
      'community',
    ];
    const categoryQuotas: Record<ActionCategory, number> = {
      indoor: 6,
      mobility: 6,
      outdoor: 5,
      household: 4,
      community: 4,
    };

    for (const cat of categories) {
      const actions = getActionsByCategory(cat);
      expect(actions.length).toBeGreaterThanOrEqual(categoryQuotas[cat]);
    }
  });

  it('guarantees unique action identifiers', () => {
    const ids = catalog.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
    expect(ACTION_CATALOG).toHaveLength(catalog.length);
    expect(ACTION_MAP.size).toBe(catalog.length);
  });
});

describe('Domain Actions Catalog attributes and sources', () => {
  it('validates action attributes and integer constraints', () => {
    for (const action of catalog) {
      expect(action.id).toMatch(/^act-[a-z]+-[a-z0-9-]+$/);
      expect(action.title.trim().length).toBeGreaterThan(5);
      expect(action.description.trim().length).toBeGreaterThan(20);
      expect(Number.isInteger(action.costRupees)).toBe(true);
      expect(action.costRupees).toBeGreaterThanOrEqual(0);
      expect([1, 2, 3]).toContain(action.effort);
      expect(['low', 'medium', 'high']).toContain(action.confidence);
      expect(action.sourceIds.length).toBeGreaterThanOrEqual(1);
      expect(action.effects.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('retrieves actions by identifier correctly', () => {
    const first = catalog[0];
    expect(first).toBeDefined();
    if (first !== undefined) {
      const found = getActionById(first.id);
      expect(found).toEqual(first);
    }
    expect(getActionById('act-nonexistent-id')).toBeUndefined();
  });

  it('links to registered evidence sources', () => {
    const registeredSourceIds = new Set(ACTION_SOURCES.map((s) => s.id));
    for (const action of catalog) {
      for (const sourceId of action.sourceIds) {
        expect(registeredSourceIds.has(sourceId)).toBe(true);
      }
    }
    expect(getActionSourceById('cpcb-emissions-inventory')).toBeDefined();
    expect(getActionSourceById('unknown-source-id')).toBeUndefined();
    expect(ACTION_SOURCES_MAP.size).toBe(ACTION_SOURCES.length);
  });
});

describe('Domain Actions transit emissions and file limits', () => {
  it('enforces verified commute transit emission factors', () => {
    const expectedFactors: Record<
      CommuteMode,
      { co2e: number; source: string }
    > = {
      walk: { co2e: 0, source: 'cpcb-emissions-inventory' },
      cycle: { co2e: 0, source: 'cpcb-emissions-inventory' },
      metro: { co2e: 18, source: 'dmrc-sustainability-report-2023' },
      bus: { co2e: 45, source: 'cpcb-emissions-inventory' },
      twoWheeler: { co2e: 75, source: 'cpcb-emissions-inventory' },
      autoRickshaw: { co2e: 60, source: 'cpcb-emissions-inventory' },
      car: { co2e: 140, source: 'cpcb-emissions-inventory' },
    };

    for (const [mode, meta] of Object.entries(expectedFactors)) {
      const typedMode = mode as CommuteMode;
      const factor = COMMUTE_EMISSION_FACTORS[typedMode];
      expect(factor.co2eGramsPerKm).toBe(meta.co2e);
      expect(factor.sourceId).toBe(meta.source);
      expect(getEmissionFactorForMode(typedMode)).toBe(meta.co2e);
    }
  });

  it('calculates commute emissions and modal shift savings correctly', () => {
    expect(calculateCommuteEmissionsGrams('car', 10)).toBe(1400);
    expect(calculateCommuteEmissionsGrams('metro', 10)).toBe(180);
    expect(calculateCommuteEmissionsGrams('walk', 5)).toBe(0);
    expect(calculateCommuteEmissionsGrams('car', -5)).toBe(0);

    const shiftSavings = calculateModalShiftSavingsGrams('car', 'metro', 10);
    expect(shiftSavings).toBe(1220);

    const reverseShift = calculateModalShiftSavingsGrams('metro', 'car', 10);
    expect(reverseShift).toBe(0);
  });

  it('ensures all src/domain/actions files are <= 200 lines', () => {
    const actionsDir = path.resolve(process.cwd(), 'src/domain/actions');
    const files = fs.readdirSync(actionsDir).filter((f) => f.endsWith('.ts'));

    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const filePath = path.join(actionsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      expect(lines.length).toBeLessThanOrEqual(200);
    }
  });
});
