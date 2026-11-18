import { describe, it, expect } from 'vitest';
import type {
  Concentrations,
  AqiCategory,
  AqiResult,
  AgeGroup,
  Member,
  HomeType,
  SealingClass,
  CookingFuel,
  HomeProfile,
  CommuteMode,
  Commute,
  Lifestyle,
  HouseholdProfile,
  HourlyReading,
  ActionCategory,
  ConfidenceLevel,
  IndoorPm25ReductionEffect,
  ExposureReductionEffect,
  EmissionsReductionEffect,
  Effect,
  Action,
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

describe('Profile and concentration contracts', () => {
  it('satisfies profile and concentrations contracts', () => {
    const conc: Concentrations = { pm25: 120, pm10: 240 };
    const aqiCat: AqiCategory = 'veryPoor';
    const aqi: AqiResult = { value: 310, category: aqiCat, dominant: 'pm25' };
    const age: AgeGroup = 'child';
    const member: Member = {
      id: 'm1',
      ageGroup: age,
      respiratoryCondition: true,
    };
    const homeType: HomeType = 'apartment';
    const seal: SealingClass = 'average';
    const fuel: CookingFuel = 'png';
    const home: HomeProfile = {
      type: homeType,
      floorAreaM2: 80,
      ceilingHeightCm: 280,
      sealing: seal,
      purifierCadrM3h: 300,
      hasKitchenExhaust: true,
      cookingFuel: fuel,
    };
    const mode: CommuteMode = 'metro';
    const commute: Commute = { mode, distanceKm: 10, minutes: 30 };
    const lifestyle: Lifestyle = {
      budgetRupees: 3000,
      outdoorMinutesPerDay: 60,
      commute,
    };
    const profile: HouseholdProfile = { members: [member], home, lifestyle };

    expect(conc.pm25).toBe(120);
    expect(aqi.dominant).toBe('pm25');
    expect(profile.members.length).toBe(1);
    expect(profile.home.type).toBe('apartment');
  });
});

describe('Action and reading contracts', () => {
  it('satisfies action and reading contracts', () => {
    const reading: HourlyReading = { hour: 8, pm25: 180, pm10: 320 };
    const cat: ActionCategory = 'indoor';
    const conf: ConfidenceLevel = 'high';
    const eff1: IndoorPm25ReductionEffect = {
      type: 'indoorPm25Reduction',
      formulaId: 'f-box',
      reductionBasisPoints: 4500,
    };
    const eff2: ExposureReductionEffect = {
      type: 'exposureReduction',
      formulaId: 'f-fit',
      reductionBasisPoints: 8500,
    };
    const eff3: EmissionsReductionEffect = {
      type: 'emissionsReduction',
      formulaId: 'f-co2',
      co2eGramsPerKm: 110,
    };
    const effect: Effect = eff1;
    const action: Action = {
      id: 'act-1',
      category: cat,
      title: 'Box fan',
      description: 'Purifier',
      costRupees: 2500,
      effort: 1,
      effects: [effect, eff2, eff3],
      sourceIds: ['s1'],
      confidence: conf,
    };

    expect(reading.hour).toBe(8);
    expect(action.effects.length).toBe(3);
    expect(action.costRupees).toBe(2500);
  });
});

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
    expect(sens).toBe('high');
    expect(plan.hourlyAqi.length).toBe(1);
    expect(recs.decisionTrace.length).toBe(0);
  });
});

describe('Engine function signatures', () => {
  it('satisfies engine function signatures', () => {
    const aqi: AqiResult = {
      value: 310,
      category: 'veryPoor',
      dominant: 'pm25',
    };
    const calcAqi: CalculateAqiFn = () => ({ ok: true, value: aqi });
    const calcIndoor: CalculateIndoorPm25Fn = () => ({ ok: true, value: 35 });
    const calcDose: CalculateInhaledDoseFn = () => ({ ok: true, value: 50 });
    const genPlan: GenerateDailyPlanFn = () => ({
      ok: true,
      value: {
        outdoorWindows: [],
        bestVentilationWindow: null,
        purifierSchedule: [],
        hourlyAqi: [aqi],
        advisorySummary: 'Safe',
      },
    });
    const genRec: GenerateRecommendationsFn = () => ({
      ok: true,
      value: { items: [], decisionTrace: [] },
    });
    const compChoices: CompareChoicesFn = () => ({
      doseDeltaUg: 10,
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
