import { describe, it, expect } from 'vitest';
import type {
  AqiResult,
  Explanation,
  DomainError,
  SensitivityLevel,
  DailyPlan,
  RecommendationResult,
  CalculateAqiFn,
  CalculateIndoorPm25Fn,
  CalculateInhaledDoseFn,
  GenerateDailyPlanFn,
  GenerateRecommendationsFn,
  CompareChoicesFn,
} from '../src/domain';

describe('Diurnal plan and explanation contracts', () => {
  it('satisfies diurnal plan and explanation contracts', () => {
    const explanation: Explanation = {
      formulaId: 'f1',
      inputs: { a: 1 },
      result: 42,
      unit: 'ug',
      assumptions: ['none'],
      sourceIds: ['s1'],
    };
    const error: DomainError = { code: 'ERR_1', message: 'test' };
    const sens: SensitivityLevel = 'high';
    const plan: DailyPlan = {
      outdoorWindows: [],
      bestVentilationWindow: null,
      purifierSchedule: [],
      hourlyAqi: [{ value: 310, category: 'veryPoor', dominant: 'pm25' }],
      advisorySummary: 'Stay indoors',
    };
    const recs: RecommendationResult = { items: [], decisionTrace: [] };

    expect(explanation.result).toBe(42);
    expect(error.code).toBe('ERR_1');
    expect(sens as string).toBe('high');
    expect(plan.hourlyAqi).toHaveLength(1);
    expect(recs.decisionTrace).toHaveLength(0);
  });
});

describe('Engine function signatures', () => {
  it('satisfies engine function signatures', () => {
    const aqi: AqiResult = {
      value: 310,
      category: 'veryPoor',
      dominant: 'pm25',
    };
    const calcAqi: CalculateAqiFn = (c) => ({
      ok: true,
      value: { ...aqi, value: c.pm25 + 300 },
    });
    const calcIndoor: CalculateIndoorPm25Fn = (c, h, p) => ({
      ok: true,
      value: c + (h ? 1 : 0) + (p ? 1 : 0),
    });
    const calcDose: CalculateInhaledDoseFn = (c, m, a) => ({
      ok: true,
      value: c + m + (a ? 1 : 0),
    });
    const genPlan: GenerateDailyPlanFn = (s, l, p) => ({
      ok: true,
      value: {
        outdoorWindows: [],
        bestVentilationWindow: null,
        purifierSchedule: [],
        hourlyAqi: [aqi],
        advisorySummary: s.length + l.length + (p ? 'Safe' : ''),
      },
    });
    const genRec: GenerateRecommendationsFn = (p, a, h, c) => ({
      ok: true,
      value: {
        items: [],
        decisionTrace: [p && h ? a.category + c.length : ''],
      },
    });
    const compChoices: CompareChoicesFn = (a, b) => ({
      doseDeltaUg: a && b ? 10 : 0,
      emissionsDeltaGrams: 20,
      summary: 'delta',
    });

    expect(calcAqi({ pm25: 10, pm10: 20 }).ok).toBe(true);
    expect(calcIndoor(50, {} as never, true).ok).toBe(true);
    expect(calcDose(10, 60, 'adult').ok).toBe(true);
    expect(genPlan([], 'low', {} as never).ok).toBe(true);
    expect(genRec({} as never, aqi, {} as never, []).ok).toBe(true);
    expect(compChoices({} as never, {} as never).doseDeltaUg).toBe(10);
  });
});
