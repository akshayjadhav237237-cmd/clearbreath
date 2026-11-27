import { describe, expect, it } from 'vitest';
import { calculateAqi } from '../src/domain/aqi';
import {
  calculateInhaledDose,
  calculateIndoorPm25,
} from '../src/domain/exposure';
import {
  ACTION_CATALOG,
  calculateModalShiftSavingsGrams,
} from '../src/domain/actions';
import {
  generateDailyPlan,
  interpolateHourlySeries,
} from '../src/domain/planner';
import {
  generateRecommendations,
  summarizeScenario,
} from '../src/domain/recommend';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../src/config/persona';
import type { HomeProfile } from '../src/domain/contracts';

describe('Quality Contract: Integer Domain Outputs (AQI & Dose)', () => {
  it('guarantees integer AQI values across all concentration ranges', () => {
    const testCases = [
      { pm25: 15.4, pm10: 25.7 },
      { pm25: 45.2, pm10: 85.9 },
      { pm25: 110.8, pm10: 230.1 },
      { pm25: 380.5, pm10: 520.6 },
    ];
    for (const tc of testCases) {
      const res = calculateAqi(tc);
      expect(res.ok).toBe(true);
      if (res.ok) expect(Number.isInteger(res.value.value)).toBe(true);
    }
  });

  it('guarantees integer micrograms in inhaled dose outputs', () => {
    const testCases = [
      { pm25: 100, min: 60, age: 'adult' as const },
      { pm25: 250, min: 120, age: 'child' as const, maskBps: 9500 },
      { pm25: 380, min: 30, age: 'older' as const, maskBps: 5000 },
    ];
    for (const tc of testCases) {
      const res = calculateInhaledDose(tc.pm25, tc.min, tc.age, tc.maskBps);
      expect(res.ok).toBe(true);
      if (res.ok) expect(Number.isInteger(res.value)).toBe(true);
    }
  });
});

describe('Quality Contract: Integer Domain Outputs (Indoor & Actions)', () => {
  const dummyHome: HomeProfile = {
    type: 'apartment',
    floorAreaM2: 90,
    ceilingHeightCm: 300,
    sealing: 'average',
    purifierCadrM3h: 250,
    hasKitchenExhaust: true,
    cookingFuel: 'png',
  };

  it('guarantees integer micrograms in indoor mass-balance concentration', () => {
    for (const pm25 of [150, 280, 420]) {
      const res = calculateIndoorPm25(pm25, dummyHome, true);
      expect(res.ok).toBe(true);
      if (res.ok) expect(Number.isInteger(res.value)).toBe(true);
    }
  });

  it('guarantees integer-only financial metrics in action catalog', () => {
    for (const action of ACTION_CATALOG) {
      expect(Number.isInteger(action.costRupees)).toBe(true);
      expect([1, 2, 3].includes(action.effort)).toBe(true);
    }
  });
});

describe('Quality Contract: Planner, Scenario & Recommender Integers', () => {
  const unpurifiedHome: HomeProfile = {
    type: 'apartment',
    floorAreaM2: 90,
    ceilingHeightCm: 300,
    sealing: 'average',
    purifierCadrM3h: null,
    hasKitchenExhaust: true,
    cookingFuel: 'png',
  };

  it('guarantees integer outputs across planner, recommendations, scenario, and unpurified home', () => {
    const unpurified = calculateIndoorPm25(215.7, unpurifiedHome, false);
    expect(unpurified.ok && Number.isInteger(unpurified.value)).toBe(true);

    const interp = interpolateHourlySeries([
      { hour: 2, pm25: 145.6, pm10: 210.4 },
      { hour: 14, pm25: 80.2, pm10: 130.8 },
    ]);
    expect(interp.ok).toBe(true);
    if (!interp.ok) return;
    for (const r of interp.value) {
      expect(Number.isInteger(r.pm25) && Number.isInteger(r.pm10)).toBe(true);
    }

    const plan = generateDailyPlan(
      interp.value,
      'high',
      DEFAULT_HOUSEHOLD_PERSONA.lifestyle
    );
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    const aqi = {
      value: 215,
      category: 'poor' as const,
      dominant: 'pm25' as const,
    };
    const recs = generateRecommendations(
      DEFAULT_HOUSEHOLD_PERSONA,
      aqi,
      plan.value,
      ACTION_CATALOG
    );
    expect(recs.ok).toBe(true);
    const summary = summarizeScenario(DEFAULT_HOUSEHOLD_PERSONA, aqi, [
      'act-indoor-seal-gaps',
    ]);
    expect(Number.isInteger(summary.baselineDoseUg)).toBe(true);
    expect(Number.isInteger(summary.mitigatedDoseUg)).toBe(true);
    expect(
      Number.isInteger(calculateModalShiftSavingsGrams('car', 'metro', 12.4))
    ).toBe(true);
  });
});
