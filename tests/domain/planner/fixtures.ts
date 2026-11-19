import type { HourlyReading, Lifestyle } from '../../../src/domain/contracts';

/** Default test lifestyle fixture. */
export const DEFAULT_LIFESTYLE: Lifestyle = {
  budgetRupees: 5000,
  outdoorMinutesPerDay: 60,
  commute: {
    mode: 'metro',
    distanceKm: 12,
    minutes: 35,
  },
};

/** Hourly PM2.5 profile for typical Delhi winter smog diurnal cycle. */
const DIURNAL_PM25_MAP: readonly number[] = [
  180, 190, 200, 210, 220, 240, 280, 310, 300, 270, 200, 140, 90, 50, 45, 52,
  80, 130, 180, 230, 290, 320, 300, 250,
];

/** Builds typical winter smog 24-hour reading series with afternoon trough. */
export function createWinterSmogReadings(): readonly HourlyReading[] {
  const readings: HourlyReading[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    const pm25 = DIURNAL_PM25_MAP[hour] ?? 150;
    const pm10 = Math.round((pm25 * 3) / 2);
    readings.push({ hour, pm25, pm10 });
  }
  return readings;
}

/** Builds an all-severe 24-hour reading series where PM2.5 is 350 ug/m3 throughout. */
export function createAllSevereReadings(): readonly HourlyReading[] {
  const readings: HourlyReading[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    readings.push({ hour, pm25: 350, pm10: 480 });
  }
  return readings;
}

/** Builds a flat 24-hour reading series with constant particulate concentrations. */
export function createFlatReadings(
  pm25 = 50,
  pm10 = 80
): readonly HourlyReading[] {
  const readings: HourlyReading[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    readings.push({ hour, pm25, pm10 });
  }
  return readings;
}
