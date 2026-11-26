import { describe, expect, it } from 'vitest';
import type { AqiCategory } from '../../../src/domain/contracts';
import { isOk } from '../../../src/shared/result';
import { calculateAqi } from '../../../src/domain/aqi';

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
