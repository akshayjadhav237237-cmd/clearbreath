import type { Result } from '../../shared/result';
import { err, ok } from '../../shared/result';
import type { DomainError, HouseholdProfile } from '../contracts';
import { householdProfileSchema } from './schemas';

/** Domain error code indicating household profile validation failure. */
export const INVALID_PROFILE_ERROR_CODE = 'INVALID_PROFILE';

/** Validates unknown payload against the household profile schema. */
export function validateHouseholdProfile(
  input: unknown
): Result<HouseholdProfile, DomainError> {
  const result = householdProfileSchema.safeParse(input);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
      .join('; ');
    return err({
      code: INVALID_PROFILE_ERROR_CODE,
      message: `Invalid household profile: ${errorDetails}`,
      details: {
        issues: result.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
          code: issue.code,
        })),
      },
    });
  }

  const profile: HouseholdProfile = {
    members: result.data.members,
    home: result.data.home,
    lifestyle: result.data.lifestyle,
  };

  return ok(profile);
}
