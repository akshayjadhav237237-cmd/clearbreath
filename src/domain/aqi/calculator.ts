import type {
  AqiCategory,
  AqiResult,
  Concentrations,
  DomainError,
} from '../contracts';
import { clampInteger, toInteger } from '../units';
import type { Result } from '../../shared/result';
import { err, ok } from '../../shared/result';
import type { BreakpointBand } from './breakpoints';
import { PM10_BREAKPOINTS, PM25_BREAKPOINTS } from './breakpoints';

/** Maximum permitted index ceiling on the CPCB AQI scale. */
export const MAX_AQI = 500;

/** Maps an AQI numeric score to its official CPCB category band. */
export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'satisfactory';
  if (aqi <= 200) return 'moderate';
  if (aqi <= 300) return 'poor';
  if (aqi <= 400) return 'veryPoor';
  return 'severe';
}

/** Calculates pollutant sub-index using CPCB piecewise linear formula. */
export function calculateSubIndex(
  concentration: number,
  breakpoints: readonly BreakpointBand[]
): number {
  const first = breakpoints[0];
  if (!first || concentration <= first.bLo) {
    return first ? first.iLo : 0;
  }

  for (const band of breakpoints) {
    if (concentration <= band.bHi) {
      const spanB = band.bHi - band.bLo;
      if (spanB <= 0) return band.iHi;
      const slope = (band.iHi - band.iLo) / spanB;
      const linear = slope * (concentration - band.bLo) + band.iLo;
      return clampInteger(toInteger(linear), band.iLo, band.iHi);
    }
  }

  const last = breakpoints[breakpoints.length - 1];
  if (!last) return MAX_AQI;
  const spanB = last.bHi - last.bLo;
  if (spanB <= 0) return MAX_AQI;
  const slope = (last.iHi - last.iLo) / spanB;
  const linear = slope * (concentration - last.bLo) + last.iLo;
  return clampInteger(toInteger(linear), last.iLo, MAX_AQI);
}

/** Calculates India CPCB National AQI from PM2.5 and PM10 concentrations. */
export function calculateAqi(
  concentrations: Concentrations
): Result<AqiResult, DomainError> {
  const { pm25, pm10 } = concentrations;

  if (
    !Number.isFinite(pm25) ||
    !Number.isFinite(pm10) ||
    pm25 < 0 ||
    pm10 < 0
  ) {
    return err({
      code: 'INVALID_CONCENTRATION',
      message: 'Particulate concentrations cannot be negative or non-finite.',
      details: { pm25, pm10 },
    });
  }

  const subPm25 = calculateSubIndex(pm25, PM25_BREAKPOINTS);
  const subPm10 = calculateSubIndex(pm10, PM10_BREAKPOINTS);
  const dominant = subPm10 > subPm25 ? 'pm10' : 'pm25';
  const value = Math.max(subPm25, subPm10);
  const category = getAqiCategory(value);

  return ok({
    value,
    category,
    dominant,
  });
}
