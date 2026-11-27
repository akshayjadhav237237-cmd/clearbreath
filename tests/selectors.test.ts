import { describe, expect, it } from 'vitest';
import { calculateAqi } from '../src/domain/aqi';
import type { HourlyReading } from '../src/domain/contracts';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../src/config/persona';
import { PRESETS } from '../src/config';
import {
  selectCurrentAqi,
  selectCurrentReading,
  selectDayPlan,
} from '../src/shared/state/selectors';

function makeSeries(pm25: number, pm10: number): readonly HourlyReading[] {
  return Array.from({ length: 24 }, (_, hour) => ({ hour, pm25, pm10 }));
}

describe('selectCurrentAqi and selectCurrentReading fallbacks', () => {
  it('returns shared hour-12 fallback curve for null or empty series', () => {
    const nullState = {
      hourlySeries: null,
      profile: DEFAULT_HOUSEHOLD_PERSONA,
    };
    const emptyState = {
      hourlySeries: { readings: [] },
      profile: DEFAULT_HOUSEHOLD_PERSONA,
    };

    expect(selectCurrentReading(nullState)).toEqual({
      hour: 12,
      pm25: 84,
      pm10: 140,
    });
    expect(selectCurrentAqi(nullState)).toEqual({
      value: 180,
      category: 'moderate',
      dominant: 'pm25',
    });
    expect(selectCurrentAqi(emptyState)).toEqual(selectCurrentAqi(nullState));
  });

  it('falls back cleanly on negative, non-finite, or invalid-hour readings', () => {
    const invalidCases: readonly (readonly HourlyReading[])[] = [
      [{ hour: 12, pm25: -5, pm10: 10 }],
      [{ hour: 12, pm25: 50, pm10: -1 }],
      [{ hour: 12, pm25: Number.NaN, pm10: 50 }],
      [{ hour: 12, pm25: 50, pm10: Number.POSITIVE_INFINITY }],
      [{ hour: -1, pm25: 30, pm10: 40 }],
      [{ hour: 24, pm25: 30, pm10: 40 }],
      [{ hour: 12.5, pm25: 30, pm10: 40 }],
    ];

    for (const readings of invalidCases) {
      const aqi = selectCurrentAqi({
        hourlySeries: { readings },
        profile: DEFAULT_HOUSEHOLD_PERSONA,
      });
      expect(aqi).toEqual({
        value: 180,
        category: 'moderate',
        dominant: 'pm25',
      });
    }
  });
});

describe('selectCurrentAqi and selectDayPlan synchronization', () => {
  it('computes headline AQI and 24h plan from the exact same series', () => {
    const severeState = {
      hourlySeries: { readings: makeSeries(380, 520) },
      profile: DEFAULT_HOUSEHOLD_PERSONA,
    };
    const aqi = selectCurrentAqi(severeState);
    const plan = selectDayPlan(severeState);
    const expected = calculateAqi({ pm25: 380, pm10: 520 });

    expect(expected.ok).toBe(true);
    if (expected.ok) expect(aqi).toEqual(expected.value);
    expect(plan.hourlyAqi).toHaveLength(24);
    expect(plan.hourlyAqi[12]).toEqual(aqi);
    expect(plan.outdoorWindows).toEqual([]);
  });

  it('interpolates partial series consistently across AQI and daily plan', () => {
    const partialState = {
      hourlySeries: {
        readings: [
          { hour: 6, pm25: 20, pm10: 40 },
          { hour: 18, pm25: 40, pm10: 60 },
        ],
      },
      profile: PRESETS.puneStudent,
    };
    const aqi = selectCurrentAqi(partialState);
    const plan = selectDayPlan(partialState);

    expect(selectCurrentReading(partialState)).toEqual({
      hour: 12,
      pm25: 30,
      pm10: 50,
    });
    expect(plan.hourlyAqi[12]).toEqual(aqi);
    expect(plan.outdoorWindows.length).toBeGreaterThan(0);
  });

  it('produces deterministic fallback 24h plan synchronized with AQI 180', () => {
    const fallbackState = {
      hourlySeries: null,
      profile: DEFAULT_HOUSEHOLD_PERSONA,
    };
    const aqi = selectCurrentAqi(fallbackState);
    const plan = selectDayPlan(fallbackState);

    expect(plan.hourlyAqi).toHaveLength(24);
    expect(plan.hourlyAqi[12]).toEqual(aqi);
    expect(plan.outdoorWindows[0]).toEqual({
      startHour: 13,
      endHour: 14,
      averageAqi: 180,
    });
  });
});
