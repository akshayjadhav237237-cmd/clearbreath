import type { Action, Explanation, HouseholdProfile } from '../contracts';
import { toInteger } from '../units';
import {
  COMMUTE_EMISSION_FACTORS,
  STANDARD_EXPOSURE_ASSUMPTIONS,
} from './constants';

export {
  calculateActionDoseReduction,
  calculateHouseholdBaselineDose,
} from './dose-quantification';

/** Inverts India CPCB NAQI breakpoints to estimate outdoor ambient PM2.5 concentration. */
export function aqiToPm25(aqi: number): number {
  if (aqi <= 0) return 0;
  if (aqi <= 50) return toInteger((aqi / 50) * 30);
  if (aqi <= 100) return toInteger(30 + ((aqi - 50) / 50) * 30);
  if (aqi <= 200) return toInteger(60 + ((aqi - 100) / 100) * 30);
  if (aqi <= 300) return toInteger(90 + ((aqi - 200) / 100) * 30);
  if (aqi <= 400) return toInteger(120 + ((aqi - 300) / 100) * 130);
  return toInteger(250 + ((aqi - 400) / 100) * 100);
}

/** Computes round-trip daily CO2e emissions reduction in integer grams for transit actions. */
export function calculateEmissionsSaved(
  action: Action,
  profile: HouseholdProfile
): number {
  const isMobility =
    action.category === 'mobility' ||
    action.effects.some((e) => e.type === 'emissionsReduction');
  if (!isMobility) return 0;

  const baselineFactor =
    COMMUTE_EMISSION_FACTORS[profile.lifestyle.commute.mode] ?? 0;
  const emissionsEffect = action.effects.find(
    (e) => e.type === 'emissionsReduction'
  );

  let actionFactor = 0;
  if (emissionsEffect && emissionsEffect.type === 'emissionsReduction') {
    actionFactor = emissionsEffect.co2eGramsPerKm;
  } else if (action.id.toLowerCase().includes('metro')) {
    actionFactor = COMMUTE_EMISSION_FACTORS.metro;
  }

  const deltaFactor = Math.max(0, baselineFactor - actionFactor);
  const roundTripDistance = profile.lifestyle.commute.distanceKm * 2;
  return toInteger(deltaFactor * roundTripDistance);
}

/** Assembles verifiable explanation provenance for an intervention recommendation. */
export function buildExplanation(
  action: Action,
  doseReductionUg: number,
  inputs: Record<string, number | string>
): Explanation {
  const firstEffect = action.effects[0];
  const formulaId = firstEffect
    ? firstEffect.formulaId
    : 'indoor-pm25-mass-balance';
  const defaultSources = ['ashrae-62-2-residential', 'cpcb-naqi-2014'];
  const allSourceIds = Array.from(
    new Set([...action.sourceIds, ...defaultSources])
  );

  return {
    formulaId,
    inputs,
    result: doseReductionUg,
    unit: 'ug',
    assumptions: STANDARD_EXPOSURE_ASSUMPTIONS,
    sourceIds: allSourceIds,
  };
}
