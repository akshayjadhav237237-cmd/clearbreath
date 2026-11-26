import { describe, expect, it } from 'vitest';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../../src/config/persona';
import type { Action, AqiResult } from '../../../src/domain/contracts';
import {
  compareChoices,
  generateRecommendations,
} from '../../../src/domain/recommend';
import { RECOMMENDATION_SOURCES } from '../../../src/domain/recommend/constants';
import { TEST_ACTION_CATALOG, TEST_DAILY_PLAN } from './fixtures';

const currentAqi: AqiResult = {
  value: 320,
  category: 'veryPoor',
  dominant: 'pm25',
};

describe('generateRecommendations provenance and explanations', () => {
  it('verifies explanation provenance is fully populated with formulaId and sourceIds', () => {
    const result = generateRecommendations(
      DEFAULT_HOUSEHOLD_PERSONA,
      currentAqi,
      TEST_DAILY_PLAN,
      TEST_ACTION_CATALOG
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    for (const item of result.value.items) {
      const exp = item.explanation;
      expect(typeof exp.formulaId).toBe('string');
      expect(exp.formulaId.length).toBeGreaterThan(0);
      expect(Array.isArray(exp.sourceIds)).toBe(true);
      expect(exp.sourceIds.length).toBeGreaterThan(0);
      expect(exp.unit).toBe('ug');
      expect(exp.result).toBe(item.dailyDoseReductionUg);
      expect(exp.inputs.outdoorPm25).toBeGreaterThan(0);
      expect(exp.inputs.costRupees).toBe(item.action.costRupees);
      expect(exp.assumptions.length).toBeGreaterThan(0);
    }
  });

  it('validates human-readable decision trace logs filtering rules and selection', () => {
    const result = generateRecommendations(
      DEFAULT_HOUSEHOLD_PERSONA,
      currentAqi,
      TEST_DAILY_PLAN,
      TEST_ACTION_CATALOG
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const trace = result.value.decisionTrace.join('\n');
    expect(trace).toContain('Initial evaluation: 3 members');
    expect(trace).toContain('Biomass replacement requires biomass fuel');
    expect(trace).toContain('Commute shift to metro inapplicable');
    expect(trace).toContain('within budget');
    expect(trace).toContain('exceeds budget');
    expect(trace).toContain('Ranked');
  });

  it('validates recommendation scientific literature sources', () => {
    expect(RECOMMENDATION_SOURCES['cpcb-naqi-2014']?.id).toBe('cpcb-naqi-2014');
    expect(RECOMMENDATION_SOURCES['ashrae-62-2-residential']?.id).toBe(
      'ashrae-62-2-residential'
    );
  });
});

describe('compareChoices option comparison', () => {
  const metroAction = TEST_ACTION_CATALOG[5];
  const twoWheelerBaseline: Action = {
    id: 'two-wheeler-baseline',
    category: 'mobility',
    title: 'Maintain Petrol Two-Wheeler Commute',
    description: '12 km daily round-trip petrol scooter commute.',
    costRupees: 0,
    effort: 1,
    effects: [],
    sourceIds: ['cpcb-arai-vehicular-emissions-2020'],
    confidence: 'high',
  };

  it('computes dose and greenhouse emissions deltas between metro and two-wheeler', () => {
    expect(metroAction).toBeDefined();
    if (!metroAction) return;

    const comparison = compareChoices(metroAction, twoWheelerBaseline);
    expect(comparison.doseDeltaUg).toBeGreaterThan(0);
    expect(comparison.emissionsDeltaGrams).toBeGreaterThan(0);
    expect(comparison.summary).toContain('delivers');
    expect(comparison.summary).toContain('saves');
  });
});
