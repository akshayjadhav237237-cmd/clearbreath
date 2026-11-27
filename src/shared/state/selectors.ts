import { calculateAqi } from '../../domain/aqi';
import {
  generateDailyPlan,
  interpolateHourlySeries,
} from '../../domain/planner';
import { determineHouseholdSensitivity } from '../../domain/profile';
import type {
  AqiResult,
  DailyPlan,
  HouseholdProfile,
  HourlyReading,
} from '../../domain/contracts';

/** Minimal state slice required by shared AQI and daily-plan selectors. */
export interface SelectorState {
  readonly selectedCity?: string;
  readonly hourlySeries: {
    readonly readings: readonly HourlyReading[];
  } | null;
  readonly profile: HouseholdProfile;
}

const HEADLINE_HOUR = 12;

const FALLBACK_HOURLY_READINGS: readonly HourlyReading[] = Array.from(
  { length: 24 },
  (_, hour) => ({
    hour,
    pm25: hour >= 11 && hour <= 16 ? 84 : 190,
    pm10: hour >= 11 && hour <= 16 ? 140 : 300,
  })
);

const DEFAULT_FALLBACK_READING: HourlyReading = {
  hour: HEADLINE_HOUR,
  pm25: 84,
  pm10: 140,
};

const FALLBACK_AQI: AqiResult = {
  value: 180,
  category: 'moderate',
  dominant: 'pm25',
};

const EMERGENCY_PLAN: DailyPlan = {
  outdoorWindows: [{ startHour: 11, endHour: 16, averageAqi: 180 }],
  bestVentilationWindow: { startHour: 12, endHour: 15 },
  purifierSchedule: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    operationalState: hour >= 11 && hour <= 16 ? 'low' : 'high',
  })),
  hourlyAqi: [],
  advisorySummary:
    'Follow diurnal clean-air windows and keep rooms sealed during smog peaks.',
};

function isFiniteNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function isValidReading(reading: HourlyReading): boolean {
  return (
    Number.isInteger(reading.hour) &&
    reading.hour >= 0 &&
    reading.hour <= 23 &&
    isFiniteNonNegative(reading.pm25) &&
    isFiniteNonNegative(reading.pm10)
  );
}

function resolveSeries(state: SelectorState): readonly HourlyReading[] {
  const readings = state.hourlySeries?.readings;
  if (!readings || readings.length === 0 || !readings.every(isValidReading)) {
    return FALLBACK_HOURLY_READINGS;
  }
  const interpolated = interpolateHourlySeries(readings);
  return interpolated.ok ? interpolated.value : FALLBACK_HOURLY_READINGS;
}

/** Selects the unified hour-12 particulate reading from the resolved 24-hour series. */
export function selectCurrentReading(state: SelectorState): HourlyReading {
  const readings = resolveSeries(state);
  return readings[HEADLINE_HOUR] ?? DEFAULT_FALLBACK_READING;
}

/** Selects the unified headline AQI result from the resolved hour-12 reading. */
export function selectCurrentAqi(state: SelectorState): AqiResult {
  const reading = selectCurrentReading(state);
  const res = calculateAqi({ pm25: reading.pm25, pm10: reading.pm10 });
  return res.ok ? res.value : FALLBACK_AQI;
}

/** Selects the personalized 24-hour diurnal plan synchronized with the resolved telemetry series. */
export function selectDayPlan(state: SelectorState): DailyPlan {
  const readings = resolveSeries(state);
  const sensitivity = determineHouseholdSensitivity(state.profile.members);
  const planRes = generateDailyPlan(
    readings,
    sensitivity,
    state.profile.lifestyle
  );
  return planRes.ok ? planRes.value : EMERGENCY_PLAN;
}

/** Selects synchronized current headline AQI and 24-hour daily plan from shared telemetry. */
export function selectAqiAndPlan(state: SelectorState): {
  readonly aqi: AqiResult;
  readonly plan: DailyPlan;
} {
  return {
    aqi: selectCurrentAqi(state),
    plan: selectDayPlan(state),
  };
}
