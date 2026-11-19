import { describe, expect, it } from 'vitest';
import type { HourlyReading } from '../../../src/domain/contracts';
import {
  generateDailyPlan,
  interpolateHourlySeries,
  PLANNER_THRESHOLDS,
} from '../../../src/domain/planner';
import {
  createAllSevereReadings,
  createFlatReadings,
  createWinterSmogReadings,
  DEFAULT_LIFESTYLE,
} from './fixtures';

describe('Planner diurnal smog cycle analysis', () => {
  it('selects optimal outdoor and ventilation windows during afternoon trough', () => {
    const readings = createWinterSmogReadings();
    const result = generateDailyPlan(readings, 'high', DEFAULT_LIFESTYLE);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const plan = result.value;
    expect(plan.outdoorWindows.length).toBeGreaterThan(0);
    const bestOutdoor = plan.outdoorWindows[0];
    expect(bestOutdoor).toBeDefined();
    if (bestOutdoor) {
      expect(bestOutdoor.startHour).toBeGreaterThanOrEqual(13);
      expect(bestOutdoor.endHour).toBeLessThanOrEqual(16);
      expect(bestOutdoor.averageAqi).toBeLessThanOrEqual(
        PLANNER_THRESHOLDS.high.preferredMaxAqi
      );
    }

    expect(plan.bestVentilationWindow).not.toBeNull();
    if (plan.bestVentilationWindow) {
      expect(plan.bestVentilationWindow.startHour).toBeGreaterThanOrEqual(13);
      expect(plan.bestVentilationWindow.endHour).toBeLessThanOrEqual(16);
    }

    expect(plan.purifierSchedule).toHaveLength(24);
    expect(plan.purifierSchedule[2]?.operationalState).toBe('high');
    expect(plan.purifierSchedule[7]?.operationalState).toBe('high');
    expect(plan.purifierSchedule[21]?.operationalState).toBe('high');
    expect(['off', 'low']).toContain(
      plan.purifierSchedule[14]?.operationalState
    );
  });

  it('asserts stay-indoors advisory and null ventilation window on all-severe day', () => {
    const readings = createAllSevereReadings();
    const result = generateDailyPlan(readings, 'high', DEFAULT_LIFESTYLE);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const plan = result.value;
    expect(plan.outdoorWindows).toHaveLength(0);
    expect(plan.bestVentilationWindow).toBeNull();
    expect(plan.advisorySummary.toLowerCase()).toContain('stay indoors');

    for (const slot of plan.purifierSchedule) {
      expect(slot.operationalState).toBe('high');
    }
  });
});

describe('Planner interpolation and flat series handling', () => {
  it('interpolates missing hours across discontinuous reading series', () => {
    const full = createWinterSmogReadings();
    const incomplete = full.filter(
      (r: HourlyReading) => ![2, 8, 14, 20].includes(r.hour)
    );

    const interpRes = interpolateHourlySeries(incomplete);
    expect(interpRes.ok).toBe(true);
    if (!interpRes.ok) return;

    expect(interpRes.value).toHaveLength(24);
    const hour14 = interpRes.value.find((r: HourlyReading) => r.hour === 14);
    expect(hour14).toBeDefined();
    expect(hour14?.pm25).toBe(51);

    const planRes = generateDailyPlan(
      incomplete,
      'elevated',
      DEFAULT_LIFESTYLE
    );
    expect(planRes.ok).toBe(true);
    if (planRes.ok) {
      expect(planRes.value.hourlyAqi).toHaveLength(24);
    }
  });

  it('correctly handles flat series with constant concentrations across 24h', () => {
    const readings = createFlatReadings(50, 80);
    const result = generateDailyPlan(readings, 'low', DEFAULT_LIFESTYLE);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const plan = result.value;
    expect(plan.outdoorWindows.length).toBeGreaterThan(0);
    expect(plan.bestVentilationWindow).not.toBeNull();
    expect(plan.purifierSchedule).toHaveLength(24);
    expect(plan.hourlyAqi).toHaveLength(24);
  });
});

describe('Planner input validation and sensitivity thresholds', () => {
  it('rejects empty readings series with typed domain error', () => {
    const result = generateDailyPlan([], 'high', DEFAULT_LIFESTYLE);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('EMPTY_READINGS');
    }
  });

  it('enforces sensitivity-specific exposure thresholds', () => {
    const moderateSmog = createFlatReadings(105, 160);
    const highRes = generateDailyPlan(moderateSmog, 'high', DEFAULT_LIFESTYLE);
    const lowRes = generateDailyPlan(moderateSmog, 'low', DEFAULT_LIFESTYLE);

    expect(highRes.ok).toBe(true);
    expect(lowRes.ok).toBe(true);
    if (highRes.ok && lowRes.ok) {
      expect(highRes.value.outdoorWindows).toHaveLength(0);
      expect(lowRes.value.outdoorWindows.length).toBeGreaterThan(0);
    }
  });

  it('selects 1-hour ventilation window when only a single hour is acceptable', () => {
    const readings: HourlyReading[] = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      pm25: h === 13 ? 45 : 220,
      pm10: h === 13 ? 80 : 350,
    }));
    const result = generateDailyPlan(readings, 'low', DEFAULT_LIFESTYLE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.bestVentilationWindow).toEqual({
      startHour: 13,
      endHour: 14,
    });
  });
});
