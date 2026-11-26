import { describe, expect, it } from 'vitest';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../../src/config/persona';
import type {
  AqiResult,
  RecommendationResult,
} from '../../../src/domain/contracts';
import { generateRecommendations } from '../../../src/domain/recommend';
import { TEST_ACTION_CATALOG, TEST_DAILY_PLAN } from './fixtures';

type RecommendationItem = RecommendationResult['items'][number];

const currentAqi: AqiResult = {
  value: 320,
  category: 'veryPoor',
  dominant: 'pm25',
};

describe('generateRecommendations pipeline execution', () => {
  it('runs full recommendation pipeline for default household persona', () => {
    const result = generateRecommendations(
      DEFAULT_HOUSEHOLD_PERSONA,
      currentAqi,
      TEST_DAILY_PLAN,
      TEST_ACTION_CATALOG
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const { items, decisionTrace } = result.value;
    expect(items.length).toBeGreaterThan(0);
    expect(decisionTrace.length).toBeGreaterThan(0);

    const ids = items.map((i: RecommendationItem) => i.action.id);
    expect(ids).toContain('hepa-air-purifier');
    expect(ids).toContain('n95-respirator-pack');
    expect(ids).toContain('weatherstrip-seal-gaps');
    expect(ids).toContain('kitchen-exhaust-service');

    expect(ids).not.toContain('biomass-cookstove-replacement');
    expect(ids).not.toContain('shift-commute-metro');
  });
});

describe('generateRecommendations budget prioritization', () => {
  it('verifies actions within budget are prioritized over out-of-budget actions', () => {
    const result = generateRecommendations(
      DEFAULT_HOUSEHOLD_PERSONA,
      currentAqi,
      TEST_DAILY_PLAN,
      TEST_ACTION_CATALOG
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const { items } = result.value;
    const budget = DEFAULT_HOUSEHOLD_PERSONA.lifestyle.budgetRupees;

    let seenOutOfBudget = false;
    for (const item of items) {
      if (item.action.costRupees > budget) {
        seenOutOfBudget = true;
      } else {
        expect(seenOutOfBudget).toBe(false);
      }
    }

    const premium = items.find(
      (i: RecommendationItem) => i.action.id === 'premium-central-purification'
    );
    expect(premium).toBeDefined();
    if (premium) {
      expect(premium.action.costRupees).toBeGreaterThan(budget);
      expect(items[items.length - 1]?.action.id).toBe(
        'premium-central-purification'
      );
    }
  });
});

describe('generateRecommendations error handling and invalid inputs', () => {
  it('returns error when profile has no members or invalid AQI', () => {
    const emptyProfile = {
      ...DEFAULT_HOUSEHOLD_PERSONA,
      members: [],
    };
    const invalidProfileRes = generateRecommendations(
      emptyProfile,
      currentAqi,
      TEST_DAILY_PLAN,
      TEST_ACTION_CATALOG
    );
    expect(invalidProfileRes.ok).toBe(false);

    const invalidAqiRes = generateRecommendations(
      DEFAULT_HOUSEHOLD_PERSONA,
      { value: -10, category: 'good', dominant: 'pm25' },
      TEST_DAILY_PLAN,
      TEST_ACTION_CATALOG
    );
    expect(invalidAqiRes.ok).toBe(false);
  });
});
