import type { SensitivityLevel } from '../contracts';

/** Threshold bounds configuration for diurnal activity planning. */
export interface PlannerThresholds {
  readonly preferredMaxAqi: number;
  readonly absoluteMaxAqi: number;
}

/** Single configuration table of air quality index thresholds by population sensitivity level. */
export const PLANNER_THRESHOLDS: Readonly<
  Record<SensitivityLevel, PlannerThresholds>
> = {
  high: {
    preferredMaxAqi: 100,
    absoluteMaxAqi: 200,
  },
  elevated: {
    preferredMaxAqi: 200,
    absoluteMaxAqi: 300,
  },
  low: {
    preferredMaxAqi: 300,
    absoluteMaxAqi: 400,
  },
};

/** Resolves planner thresholds for a given sensitivity level. */
export function getPlannerThresholds(
  sensitivity: SensitivityLevel
): PlannerThresholds {
  return PLANNER_THRESHOLDS[sensitivity];
}
