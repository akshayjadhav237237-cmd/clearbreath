import type { Result } from '../shared/result';

/** Particulate matter ambient concentrations in integer micrograms per cubic meter. */
export interface Concentrations {
  readonly pm25: number;
  readonly pm10: number;
}

/** Official CPCB air quality index categories. */
export type AqiCategory =
  'good' | 'satisfactory' | 'moderate' | 'poor' | 'veryPoor' | 'severe';

/** Air quality index calculation outcome with dominant pollutant. */
export interface AqiResult {
  readonly value: number;
  readonly category: AqiCategory;
  readonly dominant: 'pm25' | 'pm10';
}

/** Human age cohorts for respiratory vulnerability classification. */
export type AgeGroup = 'infant' | 'child' | 'adult' | 'older';

/** Individual household resident profile. */
export interface Member {
  readonly id: string;
  readonly ageGroup: AgeGroup;
  readonly respiratoryCondition: boolean;
}

/** Residential building characteristics and typology. */
export type HomeType = 'apartment' | 'house' | 'singleRoom';
export type SealingClass = 'leaky' | 'average' | 'tight';
export type CookingFuel = 'lpg' | 'png' | 'induction' | 'biomass';

export interface HomeProfile {
  readonly type: HomeType;
  readonly floorAreaM2: number;
  readonly ceilingHeightCm: number;
  readonly sealing: SealingClass;
  readonly purifierCadrM3h: number | null;
  readonly hasKitchenExhaust: boolean;
  readonly cookingFuel: CookingFuel;
}

/** Commute transit modality and daily recurring transit. */
export type CommuteMode =
  'walk' | 'cycle' | 'twoWheeler' | 'car' | 'bus' | 'metro' | 'autoRickshaw';

export interface Commute {
  readonly mode: CommuteMode;
  readonly distanceKm: number;
  readonly minutes: number;
}

/** Daily household expenditure and transit routines. */
export interface Lifestyle {
  readonly budgetRupees: number;
  readonly outdoorMinutesPerDay: number;
  readonly commute: Commute;
}

/** Complete validated household profile model. */
export interface HouseholdProfile {
  readonly members: readonly Member[];
  readonly home: HomeProfile;
  readonly lifestyle: Lifestyle;
}

/** Hourly ambient particulate matter measurement across diurnal cycle. */
export interface HourlyReading {
  readonly hour: number;
  readonly pm25: number;
  readonly pm10: number;
}

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

/** Domain layer error model containing code and descriptive message. */
export interface DomainError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

/** Population sensitivity classification for tailored smog advisories. */
export type SensitivityLevel = 'low' | 'elevated' | 'high';

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
