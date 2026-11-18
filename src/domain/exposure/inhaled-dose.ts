import type { Result } from '../../shared/result';
import { err, ok } from '../../shared/result';
import type { AgeGroup, DomainError } from '../contracts';
import { toInteger } from '../units';
import {
  ADULT_ACTIVE_BREATHING_RATE,
  MASK_EFFICIENCIES,
  RESTING_BREATHING_RATES,
} from './constants';
import type { ActivityLevel, MaskType } from './types';

/** Resolves inhalation volumetric rate in cubic meters per hour for an age group and activity. */
export function getBreathingRate(
  ageGroup: AgeGroup,
  activity: ActivityLevel = 'resting'
): Result<number, DomainError> {
  if (ageGroup === 'adult' && activity === 'active') {
    return ok(ADULT_ACTIVE_BREATHING_RATE.rateM3h);
  }
  const param = RESTING_BREATHING_RATES[ageGroup];
  if (!param) {
    return err({
      code: 'INVALID_AGE_GROUP',
      message: `Unknown age group: ${String(ageGroup)}`,
    });
  }
  return ok(param.rateM3h);
}

/** Returns effective inward leakage protection efficiency in basis points for a mask classification. */
export function getEffectiveMaskBps(maskType: MaskType): number {
  const spec = MASK_EFFICIENCIES[maskType];
  if (!spec) {
    return 0;
  }
  return spec.effectiveBps;
}

/** Validates input parameters for inhaled dose calculation. */
function validateDoseInputs(
  concentrationUgM3: number,
  durationMinutes: number,
  maskFitBps?: number
): Result<void, DomainError> {
  if (!Number.isFinite(concentrationUgM3) || concentrationUgM3 < 0) {
    return err({
      code: 'INVALID_CONCENTRATION',
      message: 'PM2.5 concentration must be a non-negative finite number',
    });
  }
  if (!Number.isFinite(durationMinutes) || durationMinutes < 0) {
    return err({
      code: 'INVALID_DURATION',
      message: 'Duration minutes must be a non-negative finite number',
    });
  }
  if (
    maskFitBps !== undefined &&
    (!Number.isFinite(maskFitBps) || maskFitBps < 0 || maskFitBps > 10000)
  ) {
    return err({
      code: 'INVALID_MASK_FIT',
      message:
        'Mask fit efficiency basis points must be a finite number between 0 and 10000',
    });
  }
  return ok(undefined);
}

/** Computes inhaled fine particulate mass dose in integer micrograms. */
export function calculateInhaledDose(
  concentrationUgM3: number,
  durationMinutes: number,
  ageGroup: AgeGroup,
  maskFitBps?: number
): Result<number, DomainError> {
  const validation = validateDoseInputs(
    concentrationUgM3,
    durationMinutes,
    maskFitBps
  );
  if (!validation.ok) {
    return validation;
  }
  const rateParam = RESTING_BREATHING_RATES[ageGroup];
  if (!rateParam) {
    return err({
      code: 'INVALID_AGE_GROUP',
      message: `Unknown age group: ${String(ageGroup)}`,
    });
  }
  const fitBps = maskFitBps ?? 0;
  const effectiveConcentration = concentrationUgM3 * (1 - fitBps / 10000);
  const durationHours = durationMinutes / 60;
  const doseRaw = effectiveConcentration * rateParam.rateM3h * durationHours;
  return ok(Math.max(0, toInteger(doseRaw)));
}
