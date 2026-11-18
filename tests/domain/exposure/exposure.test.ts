import { describe, expect, it } from 'vitest';
import type {
  CalculateIndoorPm25Fn,
  CalculateInhaledDoseFn,
  HomeProfile,
  SealingClass,
} from '../../../src/domain/contracts';
import {
  AIR_EXCHANGE_RATES,
  calculateDwellingVolume,
  calculateIndoorPm25,
  calculateInhaledDose,
  EXPOSURE_SOURCES,
  PENETRATION_FACTOR,
  SURFACE_DEPOSITION_RATE,
} from '../../../src/domain/exposure';

const createHome = (overrides?: Partial<HomeProfile>): HomeProfile => ({
  type: 'apartment',
  floorAreaM2: 84,
  ceilingHeightCm: 300,
  sealing: 'average',
  purifierCadrM3h: null,
  hasKitchenExhaust: true,
  cookingFuel: 'lpg',
  ...overrides,
});

describe('Exposure engine - contract signatures and golden values', () => {
  it('satisfies domain contract signatures', () => {
    const indoorFn: CalculateIndoorPm25Fn = calculateIndoorPm25;
    const doseFn: CalculateInhaledDoseFn = calculateInhaledDose;
    expect(indoorFn).toBeDefined();
    expect(doseFn).toBeDefined();
  });

  it('calculates golden test: baseline indoor PM2.5 with average sealing', () => {
    const home = createHome();
    const result = calculateIndoorPm25(200, home, false);
    expect(result).toEqual({ ok: true, value: 123 });
  });

  it('calculates golden test: indoor PM2.5 with active air purifier', () => {
    const home = createHome({ purifierCadrM3h: 250 });
    const result = calculateIndoorPm25(200, home, true);
    expect(result).toEqual({ ok: true, value: 63 });
  });

  it('calculates golden test: inhaled dose for unmasked adult', () => {
    const result = calculateInhaledDose(100, 60, 'adult');
    expect(result).toEqual({ ok: true, value: 75 });
  });

  it('calculates golden test: inhaled dose for adult with N95 mask', () => {
    const result = calculateInhaledDose(100, 60, 'adult', 8500);
    expect(result).toEqual({ ok: true, value: 11 });
  });
});

describe('Exposure engine - envelope tightness and operational states', () => {
  it('calculates indoor PM2.5 for tight and leaky envelopes', () => {
    const tightHome = createHome({ sealing: 'tight' });
    const leakyHome = createHome({ sealing: 'leaky' });
    expect(calculateIndoorPm25(200, tightHome, false)).toEqual({
      ok: true,
      value: 95,
    });
    expect(calculateIndoorPm25(200, leakyHome, false)).toEqual({
      ok: true,
      value: 138,
    });
  });

  it('disregards CADR when purifierActive is false or CADR is null', () => {
    const homeWithCadr = createHome({ purifierCadrM3h: 300 });
    expect(calculateIndoorPm25(200, homeWithCadr, false)).toEqual({
      ok: true,
      value: 123,
    });
    const homeNullCadr = createHome({ purifierCadrM3h: null });
    expect(calculateIndoorPm25(200, homeNullCadr, true)).toEqual({
      ok: true,
      value: 123,
    });
  });

  it('handles zero outdoor concentration gracefully', () => {
    const home = createHome();
    const result = calculateIndoorPm25(0, home, false);
    expect(result).toEqual({ ok: true, value: 0 });
  });
});

describe('Exposure engine - dwelling volume validation', () => {
  it('validates dwelling volume calculations', () => {
    expect(calculateDwellingVolume(84, 300)).toEqual({
      ok: true,
      value: 252,
    });
    expect(calculateDwellingVolume(0, 300)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_HOME_DIMENSIONS' },
    });
    expect(calculateDwellingVolume(84, -10)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_HOME_DIMENSIONS' },
    });
    expect(calculateDwellingVolume(Number.NaN, 300)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_HOME_DIMENSIONS' },
    });
  });
});

describe('Exposure engine - parameter validation and sources', () => {
  it('rejects invalid inputs with descriptive DomainErrors', () => {
    const home = createHome();
    expect(calculateIndoorPm25(-5, home, false)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_CONCENTRATION' },
    });
    expect(calculateIndoorPm25(Number.NaN, home, false)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_CONCENTRATION' },
    });
    const invalidAreaHome = createHome({ floorAreaM2: 0 });
    expect(calculateIndoorPm25(100, invalidAreaHome, false)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_HOME_DIMENSIONS' },
    });
    const invalidCadrHome = createHome({ purifierCadrM3h: -50 });
    expect(calculateIndoorPm25(100, invalidCadrHome, true)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_CADR' },
    });
    const invalidSealingHome = createHome({
      sealing: 'unknown' as SealingClass,
    });
    expect(calculateIndoorPm25(100, invalidSealingHome, false)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_SEALING' },
    });
  });

  it('validates literature sources and physical parameter constants', () => {
    expect(EXPOSURE_SOURCES['ashrae-62-2-residential']?.id).toBe(
      'ashrae-62-2-residential'
    );
    expect(EXPOSURE_SOURCES['epa-indoor-pm-penetration']?.id).toBe(
      'epa-indoor-pm-penetration'
    );
    expect(EXPOSURE_SOURCES['thatcher-deposition-pm25']?.id).toBe(
      'thatcher-deposition-pm25'
    );
    expect(AIR_EXCHANGE_RATES.average.ratePerHour).toBeCloseTo(0.8, 2);
    expect(PENETRATION_FACTOR.factor).toBeCloseTo(0.8, 2);
    expect(SURFACE_DEPOSITION_RATE.ratePerHour).toBeCloseTo(0.24, 2);
  });
});
