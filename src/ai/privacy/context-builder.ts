import type {
  AqiResult,
  HouseholdProfile,
  SensitivityLevel,
} from '../../domain/contracts';
import { getCityById } from '../../config/cities';
import type {
  BudgetBand,
  GroundingFact,
  Language,
  LlmSafeContext,
} from '../contracts';

/** Options parameter for building an allowlisted LLM context payload. */
export interface SafeContextOptions {
  readonly profile: HouseholdProfile;
  readonly aqi: AqiResult;
  readonly sensitivityLevel: SensitivityLevel;
  readonly city: string;
  readonly facts: readonly GroundingFact[];
  readonly question: string | null;
  readonly language: Language;
}

/** Categorizes integer rupee budget into coarse privacy-preserving bands. */
export function categorizeBudgetBand(budgetRupees: number): BudgetBand {
  if (budgetRupees < 2000) return 'low';
  if (budgetRupees <= 5000) return 'medium';
  return 'high';
}

/** Constructs an allowlisted AI payload with raw member IDs and non-allowlisted fields excluded. */
export function buildLlmSafeContext(
  options: SafeContextOptions
): LlmSafeContext {
  const { profile, aqi, sensitivityLevel, city, facts, question, language } =
    options;

  const ageGroupsPresent = Array.from(
    new Set(profile.members.map((m) => m.ageGroup))
  ).sort();

  const safeCity = getCityById(city)?.name ?? 'Selected City';

  return {
    city: safeCity,
    aqiCategory: aqi.category,
    aqiValue: aqi.value,
    sensitivityLevel,
    ageGroupsPresent,
    homeType: profile.home.type,
    sealing: profile.home.sealing,
    cookingFuel: profile.home.cookingFuel,
    commuteMode: profile.lifestyle.commute.mode,
    budgetBand: categorizeBudgetBand(profile.lifestyle.budgetRupees),
    language,
    facts,
    question,
  };
}
