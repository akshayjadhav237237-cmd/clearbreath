import type { Result } from '../../shared/result';
import { err, ok } from '../../shared/result';
import type {
  Action,
  AqiResult,
  DailyPlan,
  DomainError,
  GenerateRecommendationsFn,
  HouseholdProfile,
  RecommendationResult,
} from '../contracts';
import { calculateReductionBasisPoints } from '../units';
import { checkActionEligibility } from './eligibility';
import {
  aqiToPm25,
  buildExplanation,
  calculateActionDoseReduction,
  calculateEmissionsSaved,
  calculateHouseholdBaselineDose,
} from './quantification';
import {
  calculateImpactEfficiency,
  calculateMonthlyNetRupees,
  sortRecommendations,
} from './ranking';
import type { EvaluatedItem } from './types';

/** Evaluates an individual action item and computes its impact metrics. */
function evaluateSingleAction(
  action: Action,
  profile: HouseholdProfile,
  outdoorPm25: number,
  baselineDose: number
): EvaluatedItem {
  const doseReduction = calculateActionDoseReduction(
    action,
    profile,
    outdoorPm25,
    baselineDose
  );
  const basisPoints = calculateReductionBasisPoints(
    baselineDose,
    baselineDose - doseReduction
  );
  const co2eSaved = calculateEmissionsSaved(action, profile);
  const monthlyNet = calculateMonthlyNetRupees(action, profile);
  const efficiency = calculateImpactEfficiency(
    doseReduction,
    action.costRupees,
    action.effort
  );
  const explanation = buildExplanation(action, doseReduction, {
    outdoorPm25,
    floorAreaM2: profile.home.floorAreaM2,
    commuteKm: profile.lifestyle.commute.distanceKm,
    costRupees: action.costRupees,
    monthlyNetRupees: monthlyNet,
    baselineDoseUg: baselineDose,
    efficiencyScore: efficiency,
  });

  return {
    action,
    dailyDoseReductionUg: doseReduction,
    doseReductionBasisPoints: basisPoints,
    co2eSavedGramsPerDay: co2eSaved,
    explanation,
    withinBudget: action.costRupees <= profile.lifestyle.budgetRupees,
    efficiencyScore: efficiency,
  };
}

/** Filters and quantifies eligible catalog actions against household profile. */
function processCatalogActions(
  catalog: readonly Action[],
  profile: HouseholdProfile,
  metrics: { outdoorPm25: number; baselineDose: number },
  trace: string[]
): EvaluatedItem[] {
  const evaluated: EvaluatedItem[] = [];
  for (const action of catalog) {
    const eligibility = checkActionEligibility(action, profile);
    if (!eligibility.eligible) {
      trace.push(
        `Excluded "${action.title}" (${action.id}): ${eligibility.reason}`
      );
      continue;
    }
    trace.push(
      `Eligible "${action.title}" (${action.id}): ${eligibility.reason}`
    );
    const evaluatedItem = evaluateSingleAction(
      action,
      profile,
      metrics.outdoorPm25,
      metrics.baselineDose
    );
    const budgetMsg = evaluatedItem.withinBudget
      ? `Action "${action.title}" is within budget (₹${action.costRupees} <= ₹${profile.lifestyle.budgetRupees}).`
      : `Action "${action.title}" exceeds budget (₹${action.costRupees} > ₹${profile.lifestyle.budgetRupees}) - tagged out-of-budget.`;
    trace.push(budgetMsg);
    evaluated.push(evaluatedItem);
  }
  return evaluated;
}

/** Synthesizes personalized, ranked particulate mitigation actions with provenance explanations. */
export const generateRecommendations: GenerateRecommendationsFn = (
  profile: HouseholdProfile,
  currentAqi: AqiResult,
  _plan: DailyPlan,
  catalog: readonly Action[]
): Result<RecommendationResult, DomainError> => {
  if (!profile.members || profile.members.length === 0) {
    return err({
      code: 'INVALID_PROFILE',
      message: 'Household profile must contain at least one member.',
    });
  }
  if (!Number.isFinite(currentAqi.value) || currentAqi.value < 0) {
    return err({
      code: 'INVALID_AQI',
      message: 'Current AQI value must be a non-negative finite number.',
    });
  }

  const trace: string[] = [];
  const outdoorPm25 = aqiToPm25(currentAqi.value);
  const baselineDose = calculateHouseholdBaselineDose(profile, outdoorPm25);

  trace.push(
    `Initial evaluation: ${profile.members.length} members, AQI ${currentAqi.value} (${currentAqi.category}), estimated outdoor PM2.5: ${outdoorPm25} µg/m³.`
  );
  trace.push(`Household daily baseline inhaled dose: ${baselineDose} µg.`);

  const evaluated = processCatalogActions(
    catalog,
    profile,
    { outdoorPm25, baselineDose },
    trace
  );
  const sorted = sortRecommendations(evaluated, profile.lifestyle.budgetRupees);
  trace.push(
    `Ranked ${sorted.length} eligible recommendations prioritizing within-budget items and impact efficiency.`
  );

  return ok({
    items: sorted.map((item) => ({
      action: item.action,
      dailyDoseReductionUg: item.dailyDoseReductionUg,
      doseReductionBasisPoints: item.doseReductionBasisPoints,
      co2eSavedGramsPerDay: item.co2eSavedGramsPerDay,
      explanation: item.explanation,
    })),
    decisionTrace: trace,
  });
};
