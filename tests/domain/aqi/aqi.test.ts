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

type EdgeCase = readonly [number, number, AqiCategory];

const PM25_EDGE_CASES: readonly EdgeCase[] = [
  [0, 0, 'good'],
  [30, 50, 'good'],
  [31, 51, 'satisfactory'],
  [60, 100, 'satisfactory'],
  [61, 101, 'moderate'],
  [90, 200, 'moderate'],
  [91, 201, 'poor'],
  [120, 300, 'poor'],
  [121, 301, 'veryPoor'],
  [250, 400, 'veryPoor'],
  [251, 401, 'severe'],
  [350, 500, 'severe'],
  [500, 500, 'severe'],
];

const PM10_EDGE_CASES: readonly EdgeCase[] = [
  [0, 0, 'good'],
  [30, 30, 'good'],
  [31, 31, 'good'],
  [50, 50, 'good'],
  [51, 51, 'satisfactory'],
  [60, 60, 'satisfactory'],
  [61, 61, 'satisfactory'],
  [90, 90, 'satisfactory'],
  [91, 91, 'satisfactory'],
  [100, 100, 'satisfactory'],
  [101, 101, 'moderate'],
  [120, 114, 'moderate'],
  [121, 114, 'moderate'],
  [250, 200, 'moderate'],
  [251, 201, 'poor'],
  [350, 300, 'poor'],
  [351, 301, 'veryPoor'],
  [430, 400, 'veryPoor'],
  [431, 401, 'severe'],
  [500, 500, 'severe'],
];

const SENSITIVITIES: readonly SensitivityLevel[] = ['low', 'elevated', 'high'];
const CATEGORIES: readonly AqiCategory[] = [
  'good',
  'satisfactory',
  'moderate',
  'poor',
  'veryPoor',
  'severe',
];

describe('calculateAqi breakpoint edge evaluation', () => {
  it.each(PM25_EDGE_CASES)(
    'evaluates PM2.5 breakpoint edge at %i ug/m3 to AQI %i (%s)',
    (pm25, expectedAqi, expectedCategory) => {
      const result = calculateAqi({ pm25, pm10: 0 });
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe(expectedAqi);
        expect(result.value.category).toBe(expectedCategory);
        expect(result.value.dominant).toBe('pm25');
      }
    }
  );

  it.each(PM10_EDGE_CASES)(
    'evaluates PM10 breakpoint edge at %i ug/m3 to AQI %i (%s)',
    (pm10, expectedAqi, expectedCategory) => {
      const result = calculateAqi({ pm25: 0, pm10 });
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.value.value).toBe(expectedAqi);
        expect(result.value.category).toBe(expectedCategory);
        expect(result.value.dominant).toBe(pm10 > 0 ? 'pm10' : 'pm25');
      }
    }
  );
});

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
