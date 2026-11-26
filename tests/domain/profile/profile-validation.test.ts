import { describe, expect, it } from 'vitest';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../../src/config/persona';
import {
  CPCB_SENSITIVITY_SOURCE_ID,
  commuteSchema,
  homeProfileSchema,
  householdProfileSchema,
  lifestyleSchema,
  memberSchema,
  validateHouseholdProfile,
} from '../../../src/domain/profile';

describe('Profile rejection of invalid demographic and home bounds', () => {
  it('rejects invalid member demographics', () => {
    const p = DEFAULT_HOUSEHOLD_PERSONA;
    const emptyId = {
      ...p,
      members: [{ id: '', ageGroup: 'adult', respiratoryCondition: false }],
    };
    expect(validateHouseholdProfile(emptyId).ok).toBe(false);

    const invalidAge = {
      ...p,
      members: [
        { id: 'm1', ageGroup: 'teenager', respiratoryCondition: false },
      ],
    };
    expect(validateHouseholdProfile(invalidAge).ok).toBe(false);

    const emptyMembers = { ...p, members: [] };
    expect(validateHouseholdProfile(emptyMembers).ok).toBe(false);
  });

  it('rejects invalid home profile bounds', () => {
    const p = DEFAULT_HOUSEHOLD_PERSONA;
    expect(
      validateHouseholdProfile({ ...p, home: { ...p.home, floorAreaM2: -5 } })
        .ok
    ).toBe(false);
    expect(
      validateHouseholdProfile({ ...p, home: { ...p.home, floorAreaM2: 50.5 } })
        .ok
    ).toBe(false);
    expect(
      validateHouseholdProfile({
        ...p,
        home: { ...p.home, ceilingHeightCm: 600 },
      }).ok
    ).toBe(false);
    expect(
      validateHouseholdProfile({
        ...p,
        home: { ...p.home, cookingFuel: 'coal' },
      }).ok
    ).toBe(false);
    expect(
      validateHouseholdProfile({
        ...p,
        home: { ...p.home, purifierCadrM3h: -10 },
      }).ok
    ).toBe(false);
  });
});

describe('Profile lifestyle validation and individual schemas', () => {
  it('rejects invalid lifestyle and commute values', () => {
    const p = DEFAULT_HOUSEHOLD_PERSONA;
    expect(
      validateHouseholdProfile({
        ...p,
        lifestyle: { ...p.lifestyle, budgetRupees: -1 },
      }).ok
    ).toBe(false);
    expect(
      validateHouseholdProfile({
        ...p,
        lifestyle: { ...p.lifestyle, outdoorMinutesPerDay: 900 },
      }).ok
    ).toBe(false);
    expect(
      validateHouseholdProfile({
        ...p,
        lifestyle: {
          ...p.lifestyle,
          commute: { mode: 'plane', distanceKm: 10, minutes: 20 },
        },
      }).ok
    ).toBe(false);
  });

  it('exports valid individual schemas and source id', () => {
    expect(CPCB_SENSITIVITY_SOURCE_ID).toBe('cpcb-sensitivity-classification');
    const memberParsed = memberSchema.safeParse({
      id: 'm1',
      ageGroup: 'adult',
      respiratoryCondition: false,
    });
    expect(memberParsed.success).toBe(true);
    expect(
      homeProfileSchema.safeParse(DEFAULT_HOUSEHOLD_PERSONA.home).success
    ).toBe(true);
    expect(
      commuteSchema.safeParse(DEFAULT_HOUSEHOLD_PERSONA.lifestyle.commute)
        .success
    ).toBe(true);
    expect(
      lifestyleSchema.safeParse(DEFAULT_HOUSEHOLD_PERSONA.lifestyle).success
    ).toBe(true);
    expect(
      householdProfileSchema.safeParse(DEFAULT_HOUSEHOLD_PERSONA).success
    ).toBe(true);
  });
});
