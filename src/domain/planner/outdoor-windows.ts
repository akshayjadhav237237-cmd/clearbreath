import type { AqiResult, Lifestyle, SensitivityLevel } from '../contracts';
import { clampInteger, toInteger } from '../units';
import { getPlannerThresholds } from './thresholds';

/** Structured outdoor activity window with bounds and average air quality index. */
export interface OutdoorWindow {
  readonly startHour: number;
  readonly endHour: number;
  readonly averageAqi: number;
}

/** Computes average AQI for a candidate time window. */
function computeWindowAvg(
  hourlyAqi: readonly AqiResult[],
  start: number,
  length: number
): number {
  let sum = 0;
  for (let h = start; h < start + length; h += 1) {
    const reading = hourlyAqi[h];
    if (reading !== undefined) {
      sum += reading.value;
    }
  }
  return toInteger(sum / length);
}

/** Determines whether a candidate outdoor window outperforms the current best window. */
function isSuperiorWindow(
  avg: number,
  bestAqi: number,
  start: number,
  bestWindow: OutdoorWindow | null
): boolean {
  if (avg < bestAqi) return true;
  if (avg === bestAqi && bestWindow !== null) {
    return Math.abs(start - 13) < Math.abs(bestWindow.startHour - 13);
  }
  return false;
}

/** Finds the optimal continuous window for a given duration below the maximum AQI limit. */
function findBestWindowForDuration(
  hourlyAqi: readonly AqiResult[],
  length: number,
  maxAqi: number
): OutdoorWindow | null {
  let bestWindow: OutdoorWindow | null = null;
  let bestAqi = Number.POSITIVE_INFINITY;

  for (let start = 0; start <= 24 - length; start += 1) {
    const avg = computeWindowAvg(hourlyAqi, start, length);
    if (avg <= maxAqi && isSuperiorWindow(avg, bestAqi, start, bestWindow)) {
      bestAqi = avg;
      bestWindow = {
        startHour: start,
        endHour: start + length,
        averageAqi: avg,
      };
    }
  }

  return bestWindow;
}

/** Detects and ranks outdoor activity windows of 1 to 3 hours based on sensitivity thresholds. */
export function detectOutdoorWindows(
  hourlyAqi: readonly AqiResult[],
  sensitivity: SensitivityLevel,
  lifestyle: Lifestyle
): readonly OutdoorWindow[] {
  const isAllSevere = hourlyAqi.every(
    (a) => a.value > 400 || a.category === 'severe'
  );
  if (isAllSevere) {
    return [];
  }

  const thresholds = getPlannerThresholds(sensitivity);
  const windows: OutdoorWindow[] = [];

  for (let len = 1; len <= 3; len += 1) {
    const candidate = findBestWindowForDuration(
      hourlyAqi,
      len,
      thresholds.absoluteMaxAqi
    );
    if (candidate !== null) {
      windows.push(candidate);
    }
  }

  const targetHours = clampInteger(
    Math.round(lifestyle.outdoorMinutesPerDay / 60),
    1,
    3
  );

  return windows.sort((a, b) => {
    const aPreferred = a.averageAqi <= thresholds.preferredMaxAqi ? 1 : 0;
    const bPreferred = b.averageAqi <= thresholds.preferredMaxAqi ? 1 : 0;
    if (aPreferred !== bPreferred) {
      return bPreferred - aPreferred;
    }

    if (a.averageAqi !== b.averageAqi) {
      return a.averageAqi - b.averageAqi;
    }

    const aLen = a.endHour - a.startHour;
    const bLen = b.endHour - b.startHour;
    const aTargetDiff = Math.abs(aLen - targetHours);
    const bTargetDiff = Math.abs(bLen - targetHours);
    if (aTargetDiff !== bTargetDiff) {
      return aTargetDiff - bTargetDiff;
    }

    return a.startHour - b.startHour;
  });
}
