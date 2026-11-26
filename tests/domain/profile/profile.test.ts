import { describe, expect, it } from 'vitest';
import { DEFAULT_HOUSEHOLD_PERSONA } from '../../../src/config/persona';
import type { AgeGroup, Member } from '../../../src/domain/contracts';
import {
  INVALID_PROFILE_ERROR_CODE,
  determineHouseholdSensitivity,
  determineMemberSensitivity,
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
