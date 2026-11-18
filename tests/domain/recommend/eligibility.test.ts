import { describe, expect, it } from 'vitest';
import type { Action, HouseholdProfile } from '../../../src/domain/contracts';
import {
  aqiToPm25,
  calculateImpactEfficiency,
  calculateMonthlyNetRupees,
  checkActionEligibility,
  compareChoices,
  isBiomassEligible,
  isCommuteShiftEligible,
  isKitchenExhaustEligible,
  isSealingEligible,
} from '../../../src/domain/recommend';
import { TEST_ACTION_CATALOG } from './fixtures';

/** Retrieves action fixture by identifier or throws. */
function getAction(id: string): Action {
  const found = TEST_ACTION_CATALOG.find((a) => a.id === id);
  if (!found) {
    throw new Error(`Action fixture not found: ${id}`);
  }
  return found;
}

describe('eligibility rule evaluation', () => {
  const biomassAction = getAction('biomass-cookstove-replacement');
  const exhaustAction = getAction('kitchen-exhaust-service');
  const metroAction = getAction('shift-commute-metro');
  const sealingAction = getAction('weatherstrip-seal-gaps');

  it('evaluates biomass cookstove replacement eligibility', () => {
    expect(isBiomassEligible(biomassAction, 'biomass').eligible).toBe(true);
    expect(isBiomassEligible(biomassAction, 'lpg').eligible).toBe(false);
    expect(isBiomassEligible(biomassAction, 'png').eligible).toBe(false);
    expect(isBiomassEligible(exhaustAction, 'png').eligible).toBe(true);
  });

  it('evaluates kitchen exhaust servicing eligibility', () => {
    expect(isKitchenExhaustEligible(exhaustAction, true).eligible).toBe(true);
    expect(isKitchenExhaustEligible(exhaustAction, false).eligible).toBe(false);
    expect(isKitchenExhaustEligible(biomassAction, false).eligible).toBe(true);
  });

  it('evaluates commute transition eligibility', () => {
    expect(isCommuteShiftEligible(metroAction, 'twoWheeler').eligible).toBe(
      true
    );
    expect(isCommuteShiftEligible(metroAction, 'car').eligible).toBe(true);
    expect(isCommuteShiftEligible(metroAction, 'metro').eligible).toBe(false);
    expect(isCommuteShiftEligible(metroAction, 'walk').eligible).toBe(false);
    expect(isCommuteShiftEligible(metroAction, 'cycle').eligible).toBe(false);
  });

  it('evaluates building envelope sealing eligibility', () => {
    expect(isSealingEligible(sealingAction, 'leaky').eligible).toBe(true);
    expect(isSealingEligible(sealingAction, 'average').eligible).toBe(true);
    expect(isSealingEligible(sealingAction, 'tight').eligible).toBe(false);
  });

  it('evaluates overall profile checkActionEligibility', () => {
    const profile: HouseholdProfile = {
      members: [{ id: 'm1', ageGroup: 'adult', respiratoryCondition: false }],
      home: {
        type: 'house',
        floorAreaM2: 120,
        ceilingHeightCm: 300,
        sealing: 'leaky',
        purifierCadrM3h: null,
        hasKitchenExhaust: false,
        cookingFuel: 'biomass',
      },
      lifestyle: {
        budgetRupees: 10000,
        outdoorMinutesPerDay: 60,
        commute: { mode: 'twoWheeler', distanceKm: 15, minutes: 40 },
      },
    };

    expect(checkActionEligibility(biomassAction, profile).eligible).toBe(true);
    expect(checkActionEligibility(exhaustAction, profile).eligible).toBe(false);
    expect(checkActionEligibility(metroAction, profile).eligible).toBe(true);
    expect(checkActionEligibility(sealingAction, profile).eligible).toBe(true);
  });
});

describe('AQI inversion and impact efficiency calculations', () => {
  it('inverts CPCB AQI breakpoints across bands', () => {
    expect(aqiToPm25(-5)).toBe(0);
    expect(aqiToPm25(0)).toBe(0);
    expect(aqiToPm25(40)).toBe(24);
    expect(aqiToPm25(80)).toBe(48);
    expect(aqiToPm25(150)).toBe(75);
    expect(aqiToPm25(250)).toBe(105);
    expect(aqiToPm25(350)).toBe(185);
    expect(aqiToPm25(450)).toBe(300);
  });

  it('calculates impact efficiency scoring', () => {
    const score = calculateImpactEfficiency(2000, 1000, 2);
    expect(score).toBe(1000);

    const zeroCostScore = calculateImpactEfficiency(500, 0, 1);
    expect(zeroCostScore).toBe(500000);
  });
});

describe('Monthly net rupee impact and choice comparison', () => {
  it('calculates monthly rupee impact for actions', () => {
    const profile: HouseholdProfile = {
      members: [{ id: 'm1', ageGroup: 'adult', respiratoryCondition: false }],
      home: {
        type: 'apartment',
        floorAreaM2: 80,
        ceilingHeightCm: 280,
        sealing: 'average',
        purifierCadrM3h: null,
        hasKitchenExhaust: true,
        cookingFuel: 'png',
      },
      lifestyle: {
        budgetRupees: 5000,
        outdoorMinutesPerDay: 30,
        commute: { mode: 'twoWheeler', distanceKm: 10, minutes: 30 },
      },
    };

    const metroAction = getAction('shift-commute-metro');
    const purifierAction = getAction('hepa-air-purifier');

    const monthlyMetro = calculateMonthlyNetRupees(metroAction, profile);
    expect(monthlyMetro).toBeGreaterThan(0);

    const monthlyPurifier = calculateMonthlyNetRupees(purifierAction, profile);
    expect(monthlyPurifier).toBeLessThan(0);
  });

  it('runs compareChoices with custom context and inverted deltas', () => {
    const purifier = getAction('hepa-air-purifier');
    const n95 = getAction('n95-respirator-pack');

    const comparison = compareChoices(n95, purifier, {
      commuteKm: 15,
      currentOutdoorPm25: 350,
      home: {
        type: 'apartment',
        floorAreaM2: 100,
        ceilingHeightCm: 280,
        sealing: 'average',
        purifierCadrM3h: 300,
        hasKitchenExhaust: true,
        cookingFuel: 'png',
      },
    });

    expect(typeof comparison.doseDeltaUg).toBe('number');
    expect(typeof comparison.emissionsDeltaGrams).toBe('number');
    expect(comparison.summary.length).toBeGreaterThan(0);
  });
});
