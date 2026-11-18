import type {
  Action,
  Explanation,
  ExposureReductionEffect,
  HouseholdProfile,
  IndoorPm25ReductionEffect,
} from '../contracts';
import { calculateIndoorPm25, calculateInhaledDose } from '../exposure';
import { toInteger } from '../units';
import {
  COMMUTE_EMISSION_FACTORS,
  MINUTES_PER_DAY,
  STANDARD_EXPOSURE_ASSUMPTIONS,
} from './constants';

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

interface ExposureContext {
  readonly indoorPm25: number;
  readonly outdoorMins: number;
  readonly commuteMins: number;
  readonly indoorMins: number;
}

/** Resolves indoor concentrations and daily minute distributions for exposure modeling. */
function resolveExposureContext(
  profile: HouseholdProfile,
  outdoorPm25: number
): ExposureContext {
  const indoorRes = calculateIndoorPm25(outdoorPm25, profile.home, false);
  const indoorPm25 = indoorRes.ok
    ? indoorRes.value
    : toInteger(outdoorPm25 * 0.7);
  const outdoorMins = profile.lifestyle.outdoorMinutesPerDay;
  const commuteMins = profile.lifestyle.commute.minutes * 2;
  const indoorMins = Math.max(0, MINUTES_PER_DAY - (outdoorMins + commuteMins));
  return { indoorPm25, outdoorMins, commuteMins, indoorMins };
}

/** Computes estimated baseline daily inhaled dose in integer ug across household members. */
export function calculateHouseholdBaselineDose(
  profile: HouseholdProfile,
  outdoorPm25: number
): number {
  const ctx = resolveExposureContext(profile, outdoorPm25);

  let totalDose = 0;
  for (const member of profile.members) {
    const inDose = calculateInhaledDose(
      ctx.indoorPm25,
      ctx.indoorMins,
      member.ageGroup
    );
    const outDose = calculateInhaledDose(
      outdoorPm25,
      ctx.outdoorMins + ctx.commuteMins,
      member.ageGroup
    );
    if (inDose.ok) totalDose += inDose.value;
    if (outDose.ok) totalDose += outDose.value;
  }
  return toInteger(totalDose);
}

/** Calculates dose reduction across household members for indoor PM2.5 reduction effects. */
function calculateIndoorEffectReduction(
  effect: IndoorPm25ReductionEffect,
  profile: HouseholdProfile,
  indoorPm25: number,
  indoorMins: number
): number {
  let saved = 0;
  const factor = 1 - effect.reductionBasisPoints / 10000;
  const mitigatedIndoor = Math.max(0, toInteger(indoorPm25 * factor));
  for (const m of profile.members) {
    const base = calculateInhaledDose(indoorPm25, indoorMins, m.ageGroup);
    const next = calculateInhaledDose(mitigatedIndoor, indoorMins, m.ageGroup);
    if (base.ok && next.ok) saved += base.value - next.value;
  }
  return saved;
}

/** Calculates dose reduction across household members for exposure reduction effects. */
function calculateExposureEffectReduction(
  effect: ExposureReductionEffect,
  profile: HouseholdProfile,
  outdoorPm25: number,
  outdoorMins: number
): number {
  let saved = 0;
  for (const m of profile.members) {
    const base = calculateInhaledDose(outdoorPm25, outdoorMins, m.ageGroup);
    const next = calculateInhaledDose(
      outdoorPm25,
      outdoorMins,
      m.ageGroup,
      effect.reductionBasisPoints
    );
    if (base.ok && next.ok) saved += base.value - next.value;
  }
  return saved;
}

/** Computes daily inhaled particulate dose reduction in integer ug for an action item. */
export function calculateActionDoseReduction(
  action: Action,
  profile: HouseholdProfile,
  outdoorPm25: number,
  baselineDose: number
): number {
  const ctx = resolveExposureContext(profile, outdoorPm25);

  let savedDose = 0;
  for (const effect of action.effects) {
    if (effect.type === 'indoorPm25Reduction') {
      savedDose += calculateIndoorEffectReduction(
        effect,
        profile,
        ctx.indoorPm25,
        ctx.indoorMins
      );
    } else if (effect.type === 'exposureReduction') {
      savedDose += calculateExposureEffectReduction(
        effect,
        profile,
        outdoorPm25,
        ctx.outdoorMins + ctx.commuteMins
      );
    }
  }
  return Math.min(baselineDose, Math.max(0, toInteger(savedDose)));
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
