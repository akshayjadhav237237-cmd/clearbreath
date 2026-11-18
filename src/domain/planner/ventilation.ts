import type { AqiResult, HourlyReading } from '../contracts';

/** Ventilation window representation spanning 1 to 2 hours. */
export interface VentilationWindow {
  readonly startHour: number;
  readonly endHour: number;
}

/** Helper evaluating whether hour h is closer to midday target hour 13. */
function isCloserToMidday(h: number, currentStart: number): boolean {
  return Math.abs(h - 13) < Math.abs(currentStart - 13);
}

/** Evaluates whether two adjacent AQI slots are suitable for ventilation. */
function areSlotsAcceptable(
  aqi1: AqiResult | undefined,
  aqi2: AqiResult | undefined
): boolean {
  return Boolean(aqi1 && aqi2 && aqi1.value < 200 && aqi2.value < 200);
}

/** Evaluates if a candidate ventilation window improves upon the current best. */
function isBetterCandidate(
  avgPm25: number,
  minPm25: number,
  h: number,
  bestStart: number | null
): boolean {
  if (avgPm25 < minPm25) {
    return true;
  }
  if (avgPm25 === minPm25 && bestStart !== null) {
    return isCloserToMidday(h, bestStart);
  }
  return false;
}

/** Evaluates candidate 2-hour ventilation window across 24h diurnal cycle. */
function findBestTwoHourWindow(
  readings: readonly HourlyReading[],
  hourlyAqi: readonly AqiResult[]
): VentilationWindow | null {
  let best: VentilationWindow | null = null;
  let minPm25 = Number.POSITIVE_INFINITY;

  for (let h = 0; h < 23; h += 1) {
    const aqi1 = hourlyAqi[h];
    const aqi2 = hourlyAqi[h + 1];
    const r1 = readings[h];
    const r2 = readings[h + 1];

    if (!areSlotsAcceptable(aqi1, aqi2) || !r1 || !r2) {
      continue;
    }
    const avgPm25 = (r1.pm25 + r2.pm25) / 2;
    if (isBetterCandidate(avgPm25, minPm25, h, best?.startHour ?? null)) {
      minPm25 = avgPm25;
      best = { startHour: h, endHour: h + 2 };
    }
  }
  return best;
}

/** Evaluates candidate 1-hour ventilation window across 24h diurnal cycle. */
function findBestOneHourWindow(
  readings: readonly HourlyReading[],
  hourlyAqi: readonly AqiResult[]
): VentilationWindow | null {
  let best: VentilationWindow | null = null;
  let minPm25 = Number.POSITIVE_INFINITY;

  for (let h = 0; h < 24; h += 1) {
    const aqi = hourlyAqi[h];
    const r = readings[h];
    if (!aqi || !r || aqi.value >= 200) {
      continue;
    }
    if (isBetterCandidate(r.pm25, minPm25, h, best?.startHour ?? null)) {
      minPm25 = r.pm25;
      best = { startHour: h, endHour: h + 1 };
    }
  }
  return best;
}

/** Finds the optimal 1 to 2 hour ventilation window at diurnal particulate minimum. */
export function detectBestVentilationWindow(
  readings: readonly HourlyReading[],
  hourlyAqi: readonly AqiResult[]
): VentilationWindow | null {
  const hasModerateOrBetter = hourlyAqi.some((a) => a.value < 200);
  if (!hasModerateOrBetter) {
    return null;
  }
  return (
    findBestTwoHourWindow(readings, hourlyAqi) ??
    findBestOneHourWindow(readings, hourlyAqi)
  );
}
