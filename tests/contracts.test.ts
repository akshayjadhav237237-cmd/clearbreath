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
    expect(profile.members).toHaveLength(1);
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
    expect(action.effects).toHaveLength(3);
    expect(action.costRupees).toBe(2500);
  });
});
