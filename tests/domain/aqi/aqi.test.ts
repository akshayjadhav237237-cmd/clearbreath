import { describe, expect, it } from 'vitest';
import type {
  AqiCategory,
  Concentrations,
  SensitivityLevel,
} from '../../../src/domain/contracts';
import { isErr, isOk } from '../../../src/shared/result';
import {
  type BreakpointBand,
  CPCB_SOURCE_ID,
  CPCB_SOURCE_METADATA,
  MAX_AQI,
  PM10_BREAKPOINTS,
  PM25_BREAKPOINTS,
  calculateAqi,
  calculateSubIndex,
  getAqiCategory,
  getAqiGuidance,
} from '../../../src/domain/aqi';

const SENSITIVITIES: readonly SensitivityLevel[] = ['low', 'elevated', 'high'];
const CATEGORIES: readonly AqiCategory[] = [
  'good',
  'satisfactory',
  'moderate',
  'poor',
  'veryPoor',
  'severe',
];

describe('calculateAqi input validation and error rejection', () => {
  const invalidInputs: readonly Concentrations[] = [
    { pm25: -1, pm10: 50 },
    { pm25: 50, pm10: -1 },
    { pm25: -25, pm10: -10 },
    { pm25: Number.NaN, pm10: 50 },
    { pm25: 50, pm10: Number.POSITIVE_INFINITY },
  ];

  it.each(invalidInputs)(
    'rejects invalid concentration %o',
    (concentrations) => {
      const result = calculateAqi(concentrations);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('INVALID_CONCENTRATION');
      }
    }
  );
});

describe('calculateAqi dominant pollutant resolution', () => {
  it('identifies PM2.5 when PM2.5 sub-index is higher', () => {
    const result = calculateAqi({ pm25: 90, pm10: 50 });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.dominant).toBe('pm25');
      expect(result.value.value).toBe(200);
      expect(result.value.category).toBe('moderate');
    }
  });

  it('identifies PM10 when PM10 sub-index is higher', () => {
    const result = calculateAqi({ pm25: 10, pm10: 250 });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.dominant).toBe('pm10');
      expect(result.value.value).toBe(200);
      expect(result.value.category).toBe('moderate');
    }
  });

  it('resolves tie-break between equal sub-indices to pm25', () => {
    const result = calculateAqi({ pm25: 30, pm10: 50 });
    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.value.value).toBe(50);
      expect(result.value.dominant).toBe('pm25');
    }
  });
});

describe('getAqiCategory mapping', () => {
  it('maps boundary values correctly', () => {
    expect(getAqiCategory(0)).toBe('good');
    expect(getAqiCategory(50)).toBe('good');
    expect(getAqiCategory(51)).toBe('satisfactory');
    expect(getAqiCategory(100)).toBe('satisfactory');
    expect(getAqiCategory(101)).toBe('moderate');
    expect(getAqiCategory(200)).toBe('moderate');
    expect(getAqiCategory(201)).toBe('poor');
    expect(getAqiCategory(300)).toBe('poor');
    expect(getAqiCategory(301)).toBe('veryPoor');
    expect(getAqiCategory(400)).toBe('veryPoor');
    expect(getAqiCategory(401)).toBe('severe');
    expect(getAqiCategory(500)).toBe('severe');
  });
});

describe('getAqiGuidance coverage across tiers', () => {
  const combinations = CATEGORIES.flatMap((cat) =>
    SENSITIVITIES.map((sen) => [cat, sen] as const)
  );

  it.each(combinations)(
    'provides guidance for category %s and sensitivity %s',
    (category, sensitivity) => {
      const guidance = getAqiGuidance(category, sensitivity);
      expect(guidance).toBeDefined();
      expect(typeof guidance).toBe('string');
      expect(guidance.length).toBeGreaterThan(20);
    }
  );
});

describe('CPCB NAQI breakpoints, constants, and sub-index interpolation', () => {
  it('validates CPCB metadata and breakpoint arrays', () => {
    expect(CPCB_SOURCE_ID).toBe('cpcb-naqi-2014');
    expect(CPCB_SOURCE_METADATA.year).toBe(2014);
    expect(MAX_AQI).toBe(500);
    expect(PM25_BREAKPOINTS.length).toBeGreaterThan(0);
    expect(PM10_BREAKPOINTS.length).toBeGreaterThan(0);
    const band: BreakpointBand = PM25_BREAKPOINTS[0] as BreakpointBand;
    expect(band.bLo).toBe(0);
    expect(calculateSubIndex(25, PM25_BREAKPOINTS)).toBe(42);
    expect(calculateSubIndex(75, PM25_BREAKPOINTS)).toBe(149);
  });
});
