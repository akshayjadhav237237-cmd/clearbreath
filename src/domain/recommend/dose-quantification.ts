import type {
  Action,
  ExposureReductionEffect,
  HouseholdProfile,
  IndoorPm25ReductionEffect,
} from '../contracts';
import { calculateIndoorPm25, calculateInhaledDose } from '../exposure';
import { toInteger } from '../units';
import { MINUTES_PER_DAY } from './constants';

/** Resolved indoor concentration and daily activity duration profile. */
export interface HouseholdExposureContext {
  readonly indoorPm25: number;
  readonly outdoorMins: number;
  readonly commuteMins: number;
  readonly indoorMins: number;
}

/** Input parameters for computing household inhaled PM2.5 dose. */
export interface HouseholdDoseInput {
  readonly indoorPm25: number;
  readonly outdoorPm25: number;
  readonly indoorMins: number;
  readonly outdoorMins: number;
  readonly maskFitBps: number;
}

/** Resolves indoor concentrations and daily minute distributions for exposure modeling. */
export function resolveExposureContext(
  profile: HouseholdProfile,
  outdoorPm25: number
): HouseholdExposureContext {
  const purifierActive = profile.home.purifierCadrM3h !== null;
  const indoorRes = calculateIndoorPm25(
    outdoorPm25,
    profile.home,
    purifierActive
  );
  const indoorPm25 = indoorRes.ok
    ? indoorRes.value
    : toInteger(outdoorPm25 * 0.7);
  const outdoorMins = profile.lifestyle.outdoorMinutesPerDay;
  const commuteMins = profile.lifestyle.commute.minutes * 2;
  const indoorMins = Math.max(0, MINUTES_PER_DAY - (outdoorMins + commuteMins));
  return { indoorPm25, outdoorMins, commuteMins, indoorMins };
}

/** Computes total daily inhaled dose in integer ug across household members. */
export function calculateHouseholdDose(
  profile: HouseholdProfile,
  input: HouseholdDoseInput
): number {
  let totalDose = 0;
  for (const member of profile.members) {
    const inDose = calculateInhaledDose(
      input.indoorPm25,
      input.indoorMins,
      member.ageGroup
    );
    const outDose = calculateInhaledDose(
      input.outdoorPm25,
      input.outdoorMins,
      member.ageGroup,
      input.maskFitBps
    );
    if (inDose.ok) totalDose += inDose.value;
    if (outDose.ok) totalDose += outDose.value;
  }
  return toInteger(totalDose);
}

/** Computes estimated baseline daily inhaled dose in integer ug across household members. */
export function calculateHouseholdBaselineDose(
  profile: HouseholdProfile,
  outdoorPm25: number
): number {
  const ctx = resolveExposureContext(profile, outdoorPm25);
  return calculateHouseholdDose(profile, {
    indoorPm25: ctx.indoorPm25,
    outdoorPm25,
    indoorMins: ctx.indoorMins,
    outdoorMins: ctx.outdoorMins + ctx.commuteMins,
    maskFitBps: 0,
  });
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
