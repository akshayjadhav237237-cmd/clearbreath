import type { CommuteMode } from '../contracts';

/** Transit mode carbon intensity metadata in integer grams CO2e per passenger-km. */
export interface TransitEmissionFactor {
  readonly mode: CommuteMode;
  readonly co2eGramsPerKm: number;
  readonly sourceId: string;
}

/** Official emission factors for commute transit modes in integer g CO2e/pkm. */
export const COMMUTE_EMISSION_FACTORS: Readonly<
  Record<CommuteMode, TransitEmissionFactor>
> = {
  walk: {
    mode: 'walk',
    co2eGramsPerKm: 0,
    sourceId: 'cpcb-emissions-inventory',
  },
  cycle: {
    mode: 'cycle',
    co2eGramsPerKm: 0,
    sourceId: 'cpcb-emissions-inventory',
  },
  metro: {
    mode: 'metro',
    co2eGramsPerKm: 18,
    sourceId: 'dmrc-sustainability-report-2023',
  },
  bus: {
    mode: 'bus',
    co2eGramsPerKm: 45,
    sourceId: 'cpcb-emissions-inventory',
  },
  twoWheeler: {
    mode: 'twoWheeler',
    co2eGramsPerKm: 75,
    sourceId: 'cpcb-emissions-inventory',
  },
  autoRickshaw: {
    mode: 'autoRickshaw',
    co2eGramsPerKm: 60,
    sourceId: 'cpcb-emissions-inventory',
  },
  car: {
    mode: 'car',
    co2eGramsPerKm: 140,
    sourceId: 'cpcb-emissions-inventory',
  },
};

/** Retrieves the integer CO2e emission factor in g/pkm for a commute transit mode. */
export function getEmissionFactorForMode(mode: CommuteMode): number {
  const factor = COMMUTE_EMISSION_FACTORS[mode];
  return factor.co2eGramsPerKm;
}

/** Calculates total trip carbon emissions in integer grams CO2e. */
export function calculateCommuteEmissionsGrams(
  mode: CommuteMode,
  distanceKm: number
): number {
  if (distanceKm <= 0) {
    return 0;
  }
  const factor = getEmissionFactorForMode(mode);
  return Math.round(distanceKm * factor);
}

/** Calculates carbon emissions saved in integer grams CO2e by shifting transit modes. */
export function calculateModalShiftSavingsGrams(
  baselineMode: CommuteMode,
  replacementMode: CommuteMode,
  distanceKm: number
): number {
  if (distanceKm <= 0) {
    return 0;
  }
  const baselineEmissions = calculateCommuteEmissionsGrams(
    baselineMode,
    distanceKm
  );
  const replacementEmissions = calculateCommuteEmissionsGrams(
    replacementMode,
    distanceKm
  );
  const savings = baselineEmissions - replacementEmissions;
  return savings > 0 ? savings : 0;
}
