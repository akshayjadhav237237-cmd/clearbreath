import type { Result } from '../../shared/result';
import { ok, err } from '../../shared/result';
import type { DomainError, HourlyReading } from '../contracts';
import { toInteger } from '../units';

/** Locates the nearest preceding and following known hours for a target hour. */
function findSurroundingHours(
  knownHours: readonly number[],
  target: number
): { prevHour: number | undefined; nextHour: number | undefined } {
  let prevHour: number | undefined;
  let nextHour: number | undefined;

  for (const h of knownHours) {
    if (h < target) {
      prevHour = h;
    } else if (h > target && nextHour === undefined) {
      nextHour = h;
    }
  }

  return { prevHour, nextHour };
}

/** Computes linearly interpolated or filled particulate concentrations for a missing hour. */
function interpolateValue(
  target: number,
  prev: HourlyReading | undefined,
  next: HourlyReading | undefined
): { pm25: number; pm10: number } {
  if (prev !== undefined && next !== undefined) {
    const span = next.hour - prev.hour;
    if (span <= 0) {
      return { pm25: prev.pm25, pm10: prev.pm10 };
    }
    const ratio = (target - prev.hour) / span;
    const pm25 = Math.max(
      0,
      toInteger(prev.pm25 + ratio * (next.pm25 - prev.pm25))
    );
    const pm10 = Math.max(
      0,
      toInteger(prev.pm10 + ratio * (next.pm10 - prev.pm10))
    );
    return { pm25, pm10 };
  }

  if (prev !== undefined) {
    return { pm25: Math.max(0, prev.pm25), pm10: Math.max(0, prev.pm10) };
  }

  if (next !== undefined) {
    return { pm25: Math.max(0, next.pm25), pm10: Math.max(0, next.pm10) };
  }

  return { pm25: 0, pm10: 0 };
}

/** Builds an hourly index map from valid input readings. */
function indexReadingsByHour(
  readings: readonly HourlyReading[]
): Result<Map<number, HourlyReading>, DomainError> {
  if (readings.length === 0) {
    return err({
      code: 'EMPTY_READINGS',
      message: 'Readings series cannot be empty.',
    });
  }

  const readingsByHour = new Map<number, HourlyReading>();
  for (const r of readings) {
    if (r.hour >= 0 && r.hour <= 23) {
      readingsByHour.set(r.hour, r);
    }
  }

  if (readingsByHour.size === 0) {
    return err({
      code: 'EMPTY_READINGS',
      message: 'No valid hourly readings within 0 to 23 hours range.',
    });
  }

  return ok(readingsByHour);
}

/** Interpolates or fills missing hours to ensure a full 24-hour diurnal reading series. */
export function interpolateHourlySeries(
  readings: readonly HourlyReading[]
): Result<readonly HourlyReading[], DomainError> {
  const mapRes = indexReadingsByHour(readings);
  if (!mapRes.ok) return mapRes;
  const readingsByHour = mapRes.value;

  const knownHours = Array.from(readingsByHour.keys()).sort((a, b) => a - b);
  const completeSeries: HourlyReading[] = [];

  for (let hour = 0; hour < 24; hour += 1) {
    const existing = readingsByHour.get(hour);
    if (existing !== undefined) {
      completeSeries.push(existing);
      continue;
    }
    const { prevHour, nextHour } = findSurroundingHours(knownHours, hour);
    const prev =
      prevHour !== undefined ? readingsByHour.get(prevHour) : undefined;
    const next =
      nextHour !== undefined ? readingsByHour.get(nextHour) : undefined;
    const { pm25, pm10 } = interpolateValue(hour, prev, next);
    completeSeries.push({ hour, pm25, pm10 });
  }

  return ok(completeSeries);
}
