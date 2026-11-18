import { describe, expect, it } from 'vitest';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../../src/config/persona';
import type { AgeGroup, Member } from '../../../src/domain/contracts';
import {
  CPCB_SENSITIVITY_SOURCE_ID,
  INVALID_PROFILE_ERROR_CODE,
  commuteSchema,
  determineHouseholdSensitivity,
  determineMemberSensitivity,
  homeProfileSchema,
  householdProfileSchema,
  lifestyleSchema,
  memberSchema,
  validateHouseholdProfile,
} from '../../../src/domain/profile';

describe('Profile validation of household persona', () => {
  it('validates default household persona successfully', () => {
    const result = validateHouseholdProfile(DEFAULT_HOUSEHOLD_PERSONA);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.members).toHaveLength(3);
      expect(result.value.home.type).toBe('apartment');
      expect(result.value.lifestyle.budgetRupees).toBe(5000);
    }
  });

  it('validates profile with null purifier cadr', () => {
    const validWithNullCadr = {
      ...DEFAULT_HOUSEHOLD_PERSONA,
      home: { ...DEFAULT_HOUSEHOLD_PERSONA.home, purifierCadrM3h: null },
    };
    const result = validateHouseholdProfile(validWithNullCadr);
    expect(result.ok).toBe(true);
  });

  it('rejects non-object and null payload', () => {
    const nullResult = validateHouseholdProfile(null);
    expect(nullResult.ok).toBe(false);
    if (!nullResult.ok) {
      expect(nullResult.error.code).toBe(INVALID_PROFILE_ERROR_CODE);
    }
  });
});

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

describe('sensitivity classification rules', () => {
  const memberMatrix: readonly [
    AgeGroup,
    boolean,
    'low' | 'elevated' | 'high',
  ][] = [
    ['adult', false, 'low'],
    ['adult', true, 'high'],
    ['child', false, 'elevated'],
    ['child', true, 'high'],
    ['infant', false, 'high'],
    ['infant', true, 'high'],
    ['older', false, 'high'],
    ['older', true, 'high'],
  ];

  it.each(memberMatrix)(
    'classifies %s with respiratory=%s as %s',
    (ageGroup, respiratoryCondition, expected) => {
      const member: Member = { id: 'test', ageGroup, respiratoryCondition };
      expect(determineMemberSensitivity(member)).toBe(expected);
    }
  );

  it('determines household sensitivity based on member maximum tier', () => {
    expect(determineHouseholdSensitivity([])).toBe('low');
    const lowMembers: Member[] = [
      { id: '1', ageGroup: 'adult', respiratoryCondition: false },
    ];
    expect(determineHouseholdSensitivity(lowMembers)).toBe('low');
    const elevatedMembers: Member[] = [
      ...lowMembers,
      { id: '2', ageGroup: 'child', respiratoryCondition: false },
    ];
    expect(determineHouseholdSensitivity(elevatedMembers)).toBe('elevated');
    const highMembers: Member[] = [
      ...elevatedMembers,
      { id: '3', ageGroup: 'older', respiratoryCondition: false },
    ];
    expect(determineHouseholdSensitivity(highMembers)).toBe('high');
    const highRespMembers: Member[] = [
      { id: '1', ageGroup: 'adult', respiratoryCondition: true },
    ];
    expect(determineHouseholdSensitivity(highRespMembers)).toBe('high');
  });
});
