import type { AqiResult } from '../contracts';

/** Single hour purifier operational state entry. */
export interface PurifierSlot {
  readonly hour: number;
  readonly operationalState: 'off' | 'low' | 'high';
}

/** Determines purifier operational state for an individual diurnal hour slot. */
function determineSlotState(
  hour: number,
  aqiValue: number,
  maxDayAqi: number,
  minDayAqi: number
): 'off' | 'low' | 'high' {
  if (hour >= 22 || hour < 6) {
    return 'high';
  }

  if (aqiValue >= 301 || (maxDayAqi >= 250 && aqiValue >= maxDayAqi * 0.85)) {
    return 'high';
  }

  if (aqiValue <= 50) {
    return 'off';
  }

  if (aqiValue <= 100 && aqiValue <= minDayAqi + 15) {
    return 'off';
  }

  return 'low';
}

/** Computes the 24-hour diurnal air purifier operational schedule. */
export function computePurifierSchedule(
  hourlyAqi: readonly AqiResult[]
): readonly PurifierSlot[] {
  let maxDayAqi = 0;
  let minDayAqi = Number.POSITIVE_INFINITY;

  for (const a of hourlyAqi) {
    if (a.value > maxDayAqi) maxDayAqi = a.value;
    if (a.value < minDayAqi) minDayAqi = a.value;
  }

  const schedule: PurifierSlot[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    const reading = hourlyAqi[hour];
    const aqiValue = reading !== undefined ? reading.value : 0;
    const operationalState = determineSlotState(
      hour,
      aqiValue,
      maxDayAqi,
      minDayAqi
    );
    schedule.push({ hour, operationalState });
  }

  return schedule;
}
