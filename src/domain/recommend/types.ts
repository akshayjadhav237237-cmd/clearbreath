import type { Action, Explanation, HomeProfile } from '../contracts';

/** Context parameters for comparing two action alternatives. */
export interface ComparisonContext {
  readonly commuteKm: number;
  readonly currentOutdoorPm25: number;
  readonly home: HomeProfile;
}

/** Comparative outcome delta between two action choices. */
export interface ComparisonResult {
  readonly doseDeltaUg: number;
  readonly emissionsDeltaGrams: number;
  readonly summary: string;
}

/** Result of evaluating eligibility filtering rules for an action. */
export interface EligibilityResult {
  readonly eligible: boolean;
  readonly reason: string;
}

/** Evaluated recommendation item with scoring metadata. */
export interface EvaluatedItem {
  readonly action: Action;
  readonly dailyDoseReductionUg: number;
  readonly doseReductionBasisPoints: number;
  readonly co2eSavedGramsPerDay: number;
  readonly explanation: Explanation;
  readonly withinBudget: boolean;
  readonly efficiencyScore: number;
}

/** Bibliographic literature source reference. */
export interface RecommendationSource {
  readonly id: string;
  readonly title: string;
  readonly url: string;
}
