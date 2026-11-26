import { describe, expect, it } from 'vitest';
import { calculateAqi } from '../src/domain/aqi';
import {
  calculateInhaledDose,
  calculateIndoorPm25,
} from '../src/domain/exposure';
import { ACTION_CATALOG } from '../src/domain/actions';
import type { HomeProfile } from '../src/domain/contracts';

describe('Quality Contract: Integer Domain Outputs (AQI & Dose)', () => {
  it('guarantees integer AQI values across all concentration ranges', () => {
    const testCases = [
      { pm25: 15.4, pm10: 25.7 },
      { pm25: 45.2, pm10: 85.9 },
      { pm25: 110.8, pm10: 230.1 },
      { pm25: 380.5, pm10: 520.6 },
    ];
    for (const tc of testCases) {
      const res = calculateAqi(tc);
      expect(res.ok).toBe(true);
      if (res.ok) expect(Number.isInteger(res.value.value)).toBe(true);
    }
  });

  it('guarantees integer micrograms in inhaled dose outputs', () => {
    const testCases = [
      { pm25: 100, min: 60, age: 'adult' as const },
      { pm25: 250, min: 120, age: 'child' as const, maskBps: 9500 },
      { pm25: 380, min: 30, age: 'older' as const, maskBps: 5000 },
    ];
    for (const tc of testCases) {
      const res = calculateInhaledDose(tc.pm25, tc.min, tc.age, tc.maskBps);
      expect(res.ok).toBe(true);
      if (res.ok) expect(Number.isInteger(res.value)).toBe(true);
    }
  });
});

describe('Quality Contract: Integer Domain Outputs (Indoor & Actions)', () => {
  const dummyHome: HomeProfile = {
    type: 'apartment',
    floorAreaM2: 90,
    ceilingHeightCm: 300,
    sealing: 'average',
    purifierCadrM3h: 250,
    hasKitchenExhaust: true,
    cookingFuel: 'png',
  };

  it('guarantees integer micrograms in indoor mass-balance concentration', () => {
    for (const pm25 of [150, 280, 420]) {
      const res = calculateIndoorPm25(pm25, dummyHome, true);
      expect(res.ok).toBe(true);
      if (res.ok) expect(Number.isInteger(res.value)).toBe(true);
    }
  });

  it('guarantees integer-only financial metrics in action catalog', () => {
    for (const action of ACTION_CATALOG) {
      expect(Number.isInteger(action.costRupees)).toBe(true);
      expect([1, 2, 3].includes(action.effort)).toBe(true);
    }
  });
});
