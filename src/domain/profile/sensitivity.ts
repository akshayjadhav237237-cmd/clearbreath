import type { Member, SensitivityLevel } from '../contracts';

/** Verified provenance identifier for CPCB-based vulnerability classification. */
export const CPCB_SENSITIVITY_SOURCE_ID = 'cpcb-sensitivity-classification';

/** Determines member sensitivity level strictly for exposure advisory tiering. */
export function determineMemberSensitivity(member: Member): SensitivityLevel {
  if (
    member.respiratoryCondition ||
    member.ageGroup === 'infant' ||
    member.ageGroup === 'older'
  ) {
    return 'high';
  }
  if (member.ageGroup === 'child') {
    return 'elevated';
  }
  return 'low';
}

/** Determines household sensitivity as the maximum sensitivity across all members. */
export function determineHouseholdSensitivity(
  members: readonly Member[]
): SensitivityLevel {
  let hasElevated = false;
  for (const member of members) {
    const level = determineMemberSensitivity(member);
    if (level === 'high') {
      return 'high';
    }
    if (level === 'elevated') {
      hasElevated = true;
    }
  }
  return hasElevated ? 'elevated' : 'low';
}
