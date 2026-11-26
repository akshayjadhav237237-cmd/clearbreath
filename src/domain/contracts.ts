import type { Result } from '../shared/result';
import type {
  AgeGroup,
  AqiResult,
  Concentrations,
  DomainError,
  HomeProfile,
  HouseholdProfile,
  HourlyReading,
  Lifestyle,
  SensitivityLevel,
} from './contracts-core';

export type {
  AgeGroup,
  AqiCategory,
  AqiResult,
  Commute,
  CommuteMode,
  Concentrations,
  CookingFuel,
  DomainError,
  HomeProfile,
  HomeType,
  HourlyReading,
  HouseholdProfile,
  Lifestyle,
  Member,
  SealingClass,
  SensitivityLevel,
} from './contracts-core';

/** Action intervention domain grouping and confidence level. */
export type ActionCategory =
  'indoor' | 'mobility' | 'outdoor' | 'household' | 'community';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

/** Intervention effect specifications. */
export interface IndoorPm25ReductionEffect {
  readonly type: 'indoorPm25Reduction';
  readonly formulaId: string;
  readonly reductionBasisPoints: number;
}
export interface ExposureReductionEffect {
  readonly type: 'exposureReduction';
  readonly formulaId: string;
  readonly reductionBasisPoints: number;
}
export interface EmissionsReductionEffect {
  readonly type: 'emissionsReduction';
  readonly formulaId: string;
  readonly co2eGramsPerKm: number;
}
export type Effect =
  | IndoorPm25ReductionEffect
  | ExposureReductionEffect
  | EmissionsReductionEffect;

/** Curated particulate mitigation action item. */
export interface Action {
  readonly id: string;
  readonly category: ActionCategory;
  readonly title: string;
  readonly description: string;
  readonly costRupees: number;
  readonly effort: 1 | 2 | 3;
  readonly effects: readonly Effect[];
  readonly sourceIds: readonly string[];
  readonly confidence: ConfidenceLevel;
}

/** Detailed computational provenance for an intervention effect. */
export interface Explanation {
  readonly formulaId: string;
  readonly inputs: Record<string, number | string>;
  readonly result: number;
  readonly unit: string;
  readonly assumptions: readonly string[];
  readonly sourceIds: readonly string[];
}

/** Diurnal advisory plan. */
export interface DailyPlan {
  readonly outdoorWindows: readonly {
    startHour: number;
    endHour: number;
    averageAqi: number;
  }[];
  readonly bestVentilationWindow: { startHour: number; endHour: number } | null;
  readonly purifierSchedule: readonly {
    hour: number;
    operationalState: 'off' | 'low' | 'high';
  }[];
  readonly hourlyAqi: readonly AqiResult[];
  readonly advisorySummary: string;
}

/** Evaluated recommendation outcome with explanation. */
export interface RecommendationResult {
  readonly items: readonly {
    action: Action;
    dailyDoseReductionUg: number;
    doseReductionBasisPoints: number;
    co2eSavedGramsPerDay: number;
    explanation: Explanation;
  }[];
  readonly decisionTrace: readonly string[];
}

/** Function type contracts for each engine entry point. */
export type CalculateAqiFn = (
  c: Concentrations
) => Result<AqiResult, DomainError>;
export type CalculateIndoorPm25Fn = (
  pm: number,
  h: HomeProfile,
  on: boolean
) => Result<number, DomainError>;
export type CalculateInhaledDoseFn = (
  c: number,
  m: number,
  a: AgeGroup,
  f?: number
) => Result<number, DomainError>;
export type GenerateDailyPlanFn = (
  r: readonly HourlyReading[],
  s: SensitivityLevel,
  l: Lifestyle
) => Result<DailyPlan, DomainError>;
export type GenerateRecommendationsFn = (
  p: HouseholdProfile,
  a: AqiResult,
  pl: DailyPlan,
  cat: readonly Action[]
) => Result<RecommendationResult, DomainError>;
export type CompareChoicesFn = (
  a: Action,
  b: Action
) => { doseDeltaUg: number; emissionsDeltaGrams: number; summary: string };
