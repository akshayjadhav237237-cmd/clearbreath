import type { HouseholdProfile } from '../domain/contracts';
import type { Result } from '../shared/result';
import { ok, err } from '../shared/result';
import { householdProfileSchema } from '../domain/profile/schemas';

/** Maximum allowed string length for imported profile JSON (50 KiB limit). */
export const MAX_IMPORT_SIZE_BYTES = 51200;

/** Serializes household profile to human-readable JSON string. */
export function exportProfileJson(profile: HouseholdProfile): string {
  return JSON.stringify(profile, null, 2);
}

/** Parses and validates household profile JSON string against domain schema. */
export function importProfileJson(
  jsonString: string
): Result<HouseholdProfile, string> {
  if (jsonString.length > MAX_IMPORT_SIZE_BYTES) {
    return err('Import file exceeds maximum allowed size (50 KiB)');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return err('Failed to parse file: invalid JSON syntax');
  }

  const parseResult = householdProfileSchema.safeParse(parsed);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    return err(`Profile validation failed: ${errorDetails}`);
  }

  return ok(parseResult.data as HouseholdProfile);
}
