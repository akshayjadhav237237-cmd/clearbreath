import { getActionById } from '../actions';
import type { Action, AqiResult, HouseholdProfile } from '../contracts';
import {
  calculateReductionBasisPoints,
  clampInteger,
  toInteger,
} from '../units';
import { STANDARD_EXPOSURE_ASSUMPTIONS } from './constants';
import {
  calculateHouseholdBaselineDose,
  calculateHouseholdDose,
  resolveExposureContext,
} from './dose-quantification';
import { checkActionEligibility } from './eligibility';
import {
  INCENSE_ACTION_ID,
  INCENSE_COMBUSTION_ASSUMPTION,
  aqiToPm25,
  calculateEmissionsSaved,
} from './quantification';

/** Aggregated scenario impact summary combining household profile, ambient AQI, and active interventions. */
export interface ScenarioSummary {
  readonly outdoorPm25: number;
  readonly baselineIndoorPm25: number;
  readonly mitigatedIndoorPm25: number;
  readonly baselineDoseUg: number;
  readonly mitigatedDoseUg: number;
  readonly doseSavedBasisPoints: number;
  readonly totalCostRupees: number;
  readonly totalCo2eSavedGrams: number;
  readonly assumptions: string[];
}

/** Deduplicates action IDs and retains catalog entries eligible for the household. */
function resolveEligibleActions(
  completedActionIds: readonly string[],
  profile: HouseholdProfile
): Action[] {
  const eligible: Action[] = [];
  for (const id of new Set(completedActionIds)) {
    const action = getActionById(id);
    if (action && checkActionEligibility(action, profile).eligible) {
      eligible.push(action);
    }
  }
  return eligible;
}

/** Multiplies independent survival fractions across indoor PM2.5 and exposure effects. */
function combineSurvivalFactors(actions: readonly Action[]): {
  indoorSurvival: number;
  exposureSurvival: number;
} {
  let indoorSurvival = 1;
  let exposureSurvival = 1;
  for (const effect of actions.flatMap((action) => action.effects)) {
    if (effect.type === 'indoorPm25Reduction') {
      const bps = clampInteger(effect.reductionBasisPoints, 0, 10000);
      indoorSurvival *= 1 - bps / 10000;
    } else if (effect.type === 'exposureReduction') {
      const bps = clampInteger(effect.reductionBasisPoints, 0, 10000);
      exposureSurvival *= 1 - bps / 10000;
    }
  }
  return { indoorSurvival, exposureSurvival };
}

/** Sums total upfront cost and daily commute CO2e savings across eligible actions. */
function sumActionTotals(
  actions: readonly Action[],
  profile: HouseholdProfile
): { totalCostRupees: number; totalCo2eSavedGrams: number } {
  let totalCostRupees = 0;
  let totalCo2eSavedGrams = 0;
  for (const action of actions) {
    totalCostRupees += toInteger(action.costRupees);
    totalCo2eSavedGrams += calculateEmissionsSaved(action, profile);
  }
  return { totalCostRupees, totalCo2eSavedGrams };
}

/** Assembles model provenance and scenario assumptions including purifier and combustion notes. */
function buildScenarioAssumptions(
  profile: HouseholdProfile,
  actions: readonly Action[]
): string[] {
  const purifierNote =
    profile.home.purifierCadrM3h !== null
      ? `Purifier status: Active CADR ${profile.home.purifierCadrM3h} m³/h`
      : 'Purifier status: No active purifier';
  const assumptions = [
    ...STANDARD_EXPOSURE_ASSUMPTIONS,
    purifierNote,
    'Multiple eligible indoor and exposure effects are combined multiplicatively.',
  ];
  if (actions.some((action) => action.id === INCENSE_ACTION_ID)) {
    assumptions.push(INCENSE_COMBUSTION_ASSUMPTION);
  }
  return assumptions;
}

/** Summarizes baseline vs mitigated indoor concentration, inhaled dose, cost, and carbon savings. */
export function summarizeScenario(
  profile: HouseholdProfile,
  aqi: AqiResult,
  completedActionIds: readonly string[]
): ScenarioSummary {
  const safeAqi = Number.isFinite(aqi.value) && aqi.value > 0 ? aqi.value : 0;
  const outdoorPm25 = toInteger(aqiToPm25(safeAqi));
  const ctx = resolveExposureContext(profile, outdoorPm25);
  const baselineIndoorPm25 = ctx.indoorPm25;
  const baselineDoseUg = calculateHouseholdBaselineDose(profile, outdoorPm25);
  const eligibleActions = resolveEligibleActions(completedActionIds, profile);
  const { indoorSurvival, exposureSurvival } =
    combineSurvivalFactors(eligibleActions);
  const mitigatedIndoorPm25 = Math.max(
    0,
    toInteger(baselineIndoorPm25 * indoorSurvival)
  );
  const maskFitBps = clampInteger(
    Math.round((1 - exposureSurvival) * 10000),
    0,
    10000
  );
  const rawMitigatedDose = calculateHouseholdDose(profile, {
    indoorPm25: mitigatedIndoorPm25,
    outdoorPm25,
    indoorMins: ctx.indoorMins,
    outdoorMins: ctx.outdoorMins + ctx.commuteMins,
    maskFitBps,
  });
  const mitigatedDoseUg = clampInteger(rawMitigatedDose, 0, baselineDoseUg);
  const doseSavedBasisPoints = calculateReductionBasisPoints(
    baselineDoseUg,
    mitigatedDoseUg
  );
  const { totalCostRupees, totalCo2eSavedGrams } = sumActionTotals(
    eligibleActions,
    profile
  );

  return {
    outdoorPm25,
    baselineIndoorPm25,
    mitigatedIndoorPm25,
    baselineDoseUg,
    mitigatedDoseUg,
    doseSavedBasisPoints,
    totalCostRupees,
    totalCo2eSavedGrams,
    assumptions: buildScenarioAssumptions(profile, eligibleActions),
  };
}
