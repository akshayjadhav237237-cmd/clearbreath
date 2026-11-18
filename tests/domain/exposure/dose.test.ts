import { describe, expect, it } from 'vitest';
import type { AgeGroup } from '../../../src/domain/contracts';
import {
  ADULT_ACTIVE_BREATHING_RATE,
  calculateInhaledDose,
  EXPOSURE_SOURCES,
  getBreathingRate,
  getEffectiveMaskBps,
  MASK_EFFICIENCIES,
  RESTING_BREATHING_RATES,
} from '../../../src/domain/exposure';
import type { MaskType } from '../../../src/domain/exposure';

describe('Exposure engine - inhaled dose calculations across masks', () => {
  it('evaluates doses across mask classifications', () => {
    const surgicalDose = calculateInhaledDose(100, 60, 'adult', 4000);
    expect(surgicalDose).toEqual({ ok: true, value: 45 });

    const clothDose = calculateInhaledDose(100, 60, 'adult', 1500);
    expect(clothDose).toEqual({ ok: true, value: 64 });

    const noMaskDose = calculateInhaledDose(100, 60, 'adult', 0);
    expect(noMaskDose).toEqual({ ok: true, value: 75 });

    const fullMaskDose = calculateInhaledDose(100, 60, 'adult', 10000);
    expect(fullMaskDose).toEqual({ ok: true, value: 0 });
  });

  it('handles zero concentration and zero duration', () => {
    expect(calculateInhaledDose(0, 60, 'adult')).toEqual({
      ok: true,
      value: 0,
    });
    expect(calculateInhaledDose(100, 0, 'adult')).toEqual({
      ok: true,
      value: 0,
    });
  });
});

describe('Exposure engine - age cohorts and dose validation', () => {
  it('computes resting doses for infant, child, and older groups', () => {
    expect(calculateInhaledDose(100, 60, 'infant')).toEqual({
      ok: true,
      value: 25,
    });
    expect(calculateInhaledDose(100, 60, 'child')).toEqual({
      ok: true,
      value: 50,
    });
    expect(calculateInhaledDose(100, 60, 'older')).toEqual({
      ok: true,
      value: 65,
    });
  });

  it('rejects invalid dose estimation parameters', () => {
    expect(calculateInhaledDose(-1, 60, 'adult')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_CONCENTRATION' },
    });
    expect(calculateInhaledDose(Number.NaN, 60, 'adult')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_CONCENTRATION' },
    });
    expect(calculateInhaledDose(100, -10, 'adult')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_DURATION' },
    });
    expect(calculateInhaledDose(100, Number.NaN, 'adult')).toMatchObject({
      ok: false,
      error: { code: 'INVALID_DURATION' },
    });
    expect(calculateInhaledDose(100, 60, 'adult', -1)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_MASK_FIT' },
    });
    expect(calculateInhaledDose(100, 60, 'adult', 10001)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_MASK_FIT' },
    });
    expect(calculateInhaledDose(100, 60, 'adult', Number.NaN)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_MASK_FIT' },
    });
    expect(calculateInhaledDose(100, 60, 'invalid' as AgeGroup)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_AGE_GROUP' },
    });
  });
});

describe('Exposure engine - mask efficiencies, breathing rates, and sources', () => {
  it('evaluates effective mask protection basis points helper', () => {
    expect(getEffectiveMaskBps('n95')).toBe(8500);
    expect(getEffectiveMaskBps('surgical')).toBe(4000);
    expect(getEffectiveMaskBps('cloth')).toBe(1500);
    expect(getEffectiveMaskBps('none')).toBe(0);
    expect(getEffectiveMaskBps('unknown' as MaskType)).toBe(0);
  });

  it('provides nominal and effective mask filtration ratings', () => {
    expect(MASK_EFFICIENCIES.n95.nominalBps).toBe(9500);
    expect(MASK_EFFICIENCIES.surgical.nominalBps).toBe(6000);
    expect(MASK_EFFICIENCIES.cloth.nominalBps).toBe(3000);
    expect(MASK_EFFICIENCIES.none.nominalBps).toBe(0);
  });

  it('resolves age cohort breathing rates accurately', () => {
    expect(getBreathingRate('infant')).toEqual({ ok: true, value: 0.25 });
    expect(getBreathingRate('child')).toEqual({ ok: true, value: 0.5 });
    expect(getBreathingRate('adult', 'resting')).toEqual({
      ok: true,
      value: 0.75,
    });
    expect(getBreathingRate('adult', 'active')).toEqual({
      ok: true,
      value: 1.5,
    });
    expect(getBreathingRate('older')).toEqual({ ok: true, value: 0.65 });
    expect(getBreathingRate('invalid' as AgeGroup)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_AGE_GROUP' },
    });
  });

  it('verifies breathing rate and mask literature sources', () => {
    expect(EXPOSURE_SOURCES['cdc-niosh-n95-fit']?.id).toBe('cdc-niosh-n95-fit');
    expect(EXPOSURE_SOURCES['cdc-mask-study']?.id).toBe('cdc-mask-study');
    expect(EXPOSURE_SOURCES['epa-cloth-mask-efficiency']?.id).toBe(
      'epa-cloth-mask-efficiency'
    );
    expect(EXPOSURE_SOURCES['epa-exposure-factors-handbook']?.id).toBe(
      'epa-exposure-factors-handbook'
    );
    expect(ADULT_ACTIVE_BREATHING_RATE.rateM3h).toBe(1.5);
    expect(RESTING_BREATHING_RATES.infant.rateM3h).toBe(0.25);
  });
});
