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

/** Domain layer error model containing code and descriptive message. */
export interface DomainError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

/** Population sensitivity classification for tailored smog advisories. */
export type SensitivityLevel = 'low' | 'elevated' | 'high';
