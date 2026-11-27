import { describe, expect, it } from 'vitest';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../../src/config/persona';
import { getActionById, getActionCatalog } from '../../../src/domain/actions';
import type {
  AqiResult,
  HouseholdProfile,
} from '../../../src/domain/contracts';
import {
  calculateActionDoseReduction,
  calculateHouseholdBaselineDose,
  compareChoices,
  generateRecommendations,
  summarizeScenario,
} from '../../../src/domain/recommend';
import { STANDARD_EXPOSURE_ASSUMPTIONS } from '../../../src/domain/recommend/constants';
import { TEST_DAILY_PLAN } from './fixtures';

const SEAL_ID = 'act-indoor-seal-gaps';
const INCENSE_ID = 'act-indoor-no-incense-candles';
const P = DEFAULT_HOUSEHOLD_PERSONA;
const AQI: AqiResult = { value: 350, category: 'veryPoor', dominant: 'pm25' };
const UNPURIFIED: HouseholdProfile = {
  ...P,
  home: { ...P.home, purifierCadrM3h: null },
};

function expectAllIntegers(s: ReturnType<typeof summarizeScenario>): void {
  for (const [k, v] of Object.entries(s)) {
    if (k !== 'assumptions') expect(Number.isInteger(v)).toBe(true);
  }
}

describe('Purifier CADR impact on baseline and scenario doses', () => {
  it('reduces baseline, recommendation, and scenario doses when purifier is active', () => {
    const baseOn = calculateHouseholdBaselineDose(P, 185);
    const baseOff = calculateHouseholdBaselineDose(UNPURIFIED, 185);
    expect(baseOn).toBeLessThan(baseOff);

    const seal = getActionById(SEAL_ID);
    expect(seal).toBeDefined();
    if (!seal) return;
    expect(calculateActionDoseReduction(seal, P, 185, baseOn)).toBeLessThan(
      calculateActionDoseReduction(seal, UNPURIFIED, 185, baseOff)
    );

    const scenOn = summarizeScenario(P, AQI, []);
    const scenOff = summarizeScenario(UNPURIFIED, AQI, []);
    expect(scenOn.baselineIndoorPm25).toBeLessThan(scenOff.baselineIndoorPm25);
    expect(scenOn.baselineDoseUg).toBeLessThan(scenOff.baselineDoseUg);
    expect(scenOn.assumptions).toContain(
      'Purifier status: Active CADR 250 m³/h'
    );
    expect(scenOff.assumptions).toContain(
      'Purifier status: No active purifier'
    );
  });
});

describe('Purifier CADR impact on compareChoices', () => {
  it('reflects home purifier CADR inside compareChoices indoor evaluation', () => {
    const seal = getActionById(SEAL_ID);
    const n95 = getActionById('act-outdoor-wear-n95-transit');
    expect(seal && n95).toBeTruthy();
    if (!seal || !n95) return;

    const cmpOn = compareChoices(seal, n95, {
      commuteKm: 12,
      currentOutdoorPm25: 250,
      home: P.home,
    });
    const cmpOff = compareChoices(seal, n95, {
      commuteKm: 12,
      currentOutdoorPm25: 250,
      home: UNPURIFIED.home,
    });
    expect(cmpOn.doseDeltaUg).toBeLessThan(cmpOff.doseDeltaUg);
  });
});

describe('summarizeScenario multi-action combination', () => {
  it('combines multi-action reductions multiplicatively with bounded integer outputs', () => {
    const carProfile: HouseholdProfile = {
      ...P,
      lifestyle: {
        ...P.lifestyle,
        commute: { mode: 'car', distanceKm: 10, minutes: 30 },
      },
    };
    const summary = summarizeScenario(carProfile, AQI, [
      'act-indoor-box-fan',
      SEAL_ID,
      'act-indoor-close-windows-smog',
      'act-indoor-kitchen-exhaust',
      'act-outdoor-wear-n95-transit',
      'act-outdoor-wear-ffp2-mask',
      'act-mobility-metro-shift',
    ]);

    expectAllIntegers(summary);
    expect(summary.mitigatedIndoorPm25).toBeGreaterThan(0);
    expect(summary.mitigatedIndoorPm25).toBeLessThan(
      summary.baselineIndoorPm25
    );
    expect(summary.mitigatedDoseUg).toBeGreaterThanOrEqual(0);
    expect(summary.mitigatedDoseUg).toBeLessThan(summary.baselineDoseUg);
    expect(summary.doseSavedBasisPoints).toBeGreaterThan(0);
    expect(summary.doseSavedBasisPoints).toBeLessThanOrEqual(10000);
    expect(summary.totalCostRupees).toBe(3330);
    expect(summary.totalCo2eSavedGrams).toBe(560);
    for (const std of STANDARD_EXPOSURE_ASSUMPTIONS) {
      expect(summary.assumptions).toContain(std);
    }
  });
});

describe('summarizeScenario filtering and edge inputs', () => {
  it('deduplicates repeated IDs and filters unknown or ineligible actions', () => {
    const tight: HouseholdProfile = {
      ...UNPURIFIED,
      home: { ...UNPURIFIED.home, sealing: 'tight', hasKitchenExhaust: false },
    };
    const single = summarizeScenario(P, AQI, [SEAL_ID]);
    expect(summarizeScenario(P, AQI, [SEAL_ID, SEAL_ID, 'unknown'])).toEqual(
      single
    );

    const filtered = summarizeScenario(tight, AQI, [
      'act-household-chulha-to-clean',
      SEAL_ID,
      'act-indoor-kitchen-exhaust',
      'act-mobility-metro-shift',
    ]);
    expect(filtered.mitigatedIndoorPm25).toBe(filtered.baselineIndoorPm25);
    expect(filtered.mitigatedDoseUg).toBe(filtered.baselineDoseUg);
    expect(filtered.doseSavedBasisPoints).toBe(0);
    expect(filtered.totalCostRupees).toBe(0);
    expect(filtered.totalCo2eSavedGrams).toBe(0);
  });

  it('handles negative AQI and empty-member edge inputs safely', () => {
    const empty: HouseholdProfile = { ...P, members: [] };
    const zero = summarizeScenario(
      empty,
      { value: -10, category: 'good', dominant: 'pm25' },
      ['act-indoor-box-fan']
    );
    expectAllIntegers(zero);
    expect(zero.outdoorPm25).toBe(0);
    expect(zero.baselineDoseUg).toBe(0);
    expect(zero.mitigatedDoseUg).toBe(0);
    expect(zero.doseSavedBasisPoints).toBe(0);
  });
});

describe('act-indoor-no-incense-candles low confidence and combustion assumption', () => {
  it('marks incense elimination as low confidence and attaches explicit assumptions', () => {
    const action = getActionById(INCENSE_ID);
    expect(action).toBeDefined();
    if (!action) return;
    expect(action.confidence).toBe('low');
    expect(action.description.toLowerCase()).toContain('prior regular indoor');
    expect(action.description.toLowerCase()).toContain('no indoor source term');

    const hasNote = (items: readonly string[]) =>
      items.some((a) => /prior indoor incense/i.test(a));
    expect(hasNote(summarizeScenario(P, AQI, [INCENSE_ID]).assumptions)).toBe(
      true
    );
    expect(hasNote(summarizeScenario(P, AQI, [SEAL_ID]).assumptions)).toBe(
      false
    );

    const rec = generateRecommendations(
      P,
      AQI,
      TEST_DAILY_PLAN,
      getActionCatalog()
    );
    expect(rec.ok).toBe(true);
    if (!rec.ok) return;
    const inc = rec.value.items.find((i) => i.action.id === INCENSE_ID);
    const seal = rec.value.items.find((i) => i.action.id === SEAL_ID);
    expect(hasNote(inc?.explanation.assumptions ?? [])).toBe(true);
    expect(hasNote(seal?.explanation.assumptions ?? [])).toBe(false);
  });
});
