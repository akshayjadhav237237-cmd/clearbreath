/**
 * Recommendation and Decision Engine module.
 * Exposes personalized action generation, multi-criteria ranking, eligibility filtering, and choice comparisons.
 */

export {
  checkActionEligibility,
  isBiomassEligible,
  isCommuteShiftEligible,
  isKitchenExhaustEligible,
  isSealingEligible,
} from './eligibility';

export {
  aqiToPm25,
  calculateActionDoseReduction,
  calculateHouseholdBaselineDose,
} from './quantification';

export {
  calculateImpactEfficiency,
  calculateMonthlyNetRupees,
} from './ranking';

export { compareChoices } from './compare';

export { generateRecommendations } from './engine';

export type { ScenarioSummary } from './scenario';
export { summarizeScenario } from './scenario';
