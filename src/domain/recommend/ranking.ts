import type { Action, HouseholdProfile } from '../contracts';
import { toInteger } from '../units';
import { WORKING_DAYS_PER_MONTH } from './constants';
import type { EvaluatedItem } from './types';

/** Computes cost-effort normalized impact efficiency score in integer units. */
export function calculateImpactEfficiency(
  doseReductionUg: number,
  costRupees: number,
  effort: number
): number {
  const costWeight = Math.max(1, costRupees);
  const effortWeight = Math.max(1, effort);
  return toInteger((doseReductionUg * 1000) / (costWeight * effortWeight));
}

/** Calculates estimated monthly net rupee savings or expenditure for an action. */
export function calculateMonthlyNetRupees(
  action: Action,
  profile: HouseholdProfile
): number {
  const isTransitShift =
    action.category === 'mobility' &&
    action.id.toLowerCase().includes('metro') &&
    (profile.lifestyle.commute.mode === 'twoWheeler' ||
      profile.lifestyle.commute.mode === 'car');

  if (isTransitShift) {
    const kmRoundTrip = profile.lifestyle.commute.distanceKm * 2;
    const monthlyKm = kmRoundTrip * WORKING_DAYS_PER_MONTH;
    const ratePerKm = profile.lifestyle.commute.mode === 'car' ? 9 : 3;
    const metroRatePerKm = 2;
    const monthlyNetSavings = (ratePerKm - metroRatePerKm) * monthlyKm;
    return toInteger(monthlyNetSavings);
  }

  if (action.costRupees === 0) return 0;
  return -toInteger(action.costRupees / 12);
}

/** Sorts recommendations prioritizing within-budget items followed by impact efficiency. */
export function sortRecommendations(
  items: readonly EvaluatedItem[],
  budgetRupees: number
): readonly EvaluatedItem[] {
  return [...items].sort((a, b) => {
    const aWithin = a.action.costRupees <= budgetRupees;
    const bWithin = b.action.costRupees <= budgetRupees;
    if (aWithin && !bWithin) return -1;
    if (!aWithin && bWithin) return 1;

    if (b.efficiencyScore !== a.efficiencyScore) {
      return b.efficiencyScore - a.efficiencyScore;
    }
    if (b.dailyDoseReductionUg !== a.dailyDoseReductionUg) {
      return b.dailyDoseReductionUg - a.dailyDoseReductionUg;
    }
    return a.action.costRupees - b.action.costRupees;
  });
}
