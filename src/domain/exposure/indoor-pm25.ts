import type { Result } from '../../shared/result';
import { err, ok } from '../../shared/result';
import type { DomainError, HomeProfile } from '../contracts';
import { toInteger } from '../units';
import {
  AIR_EXCHANGE_RATES,
  PENETRATION_FACTOR,
  SURFACE_DEPOSITION_RATE,
} from './constants';

/** Computes interior dwelling volume in cubic meters from area and ceiling height. */
export function calculateDwellingVolume(
  floorAreaM2: number,
  ceilingHeightCm: number
): Result<number, DomainError> {
  if (
    !Number.isFinite(floorAreaM2) ||
    floorAreaM2 <= 0 ||
    !Number.isFinite(ceilingHeightCm) ||
    ceilingHeightCm <= 0
  ) {
    return err({
      code: 'INVALID_HOME_DIMENSIONS',
      message: 'Floor area and ceiling height must be positive finite numbers',
    });
  }
  return ok(floorAreaM2 * (ceilingHeightCm / 100));
}

/** Calculates steady-state indoor PM2.5 concentration using mass balance. */
export function calculateIndoorPm25(
  outdoorPm25: number,
  home: HomeProfile,
  purifierActive: boolean
): Result<number, DomainError> {
  if (!Number.isFinite(outdoorPm25) || outdoorPm25 < 0) {
    return err({
      code: 'INVALID_CONCENTRATION',
      message:
        'Outdoor PM2.5 concentration must be a non-negative finite number',
    });
  }
  const volumeResult = calculateDwellingVolume(
    home.floorAreaM2,
    home.ceilingHeightCm
  );
  if (!volumeResult.ok) {
    return volumeResult;
  }
  const exchangeRate = AIR_EXCHANGE_RATES[home.sealing];
  if (!exchangeRate) {
    return err({
      code: 'INVALID_SEALING',
      message: `Unknown home sealing class: ${String(home.sealing)}`,
    });
  }
  if (
    home.purifierCadrM3h !== null &&
    (!Number.isFinite(home.purifierCadrM3h) || home.purifierCadrM3h < 0)
  ) {
    return err({
      code: 'INVALID_CADR',
      message: 'Purifier CADR must be a non-negative finite number or null',
    });
  }
  const cadr =
    purifierActive && home.purifierCadrM3h !== null ? home.purifierCadrM3h : 0;
  const removalRate =
    exchangeRate.ratePerHour +
    SURFACE_DEPOSITION_RATE.ratePerHour +
    cadr / volumeResult.value;
  const cinRaw =
    (exchangeRate.ratePerHour * PENETRATION_FACTOR.factor * outdoorPm25) /
    removalRate;
  return ok(Math.max(0, toInteger(cinRaw)));
}
