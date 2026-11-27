import * as z from 'zod/mini';
import { getCityById } from '../config/cities';
import type { HouseholdProfile } from '../domain/contracts';
import { householdProfileSchema } from '../domain/profile/schemas';

/** Namespace key for versioned local storage state. */
export const PERSISTENCE_STORAGE_KEY = 'clearbreath_state_v1';

/** Maximum allowed payload length in code units (100 KiB limit). */
export const MAX_PERSISTENCE_PAYLOAD_BYTES = 102400;

type PersistenceErrorCode =
  | 'STORAGE_UNAVAILABLE'
  | 'PAYLOAD_TOO_LARGE'
  | 'INVALID_SCHEMA'
  | 'MIGRATION_FAILED';

/** Structured error emitted when storage operations fail. */
export interface PersistenceError {
  readonly code: PersistenceErrorCode;
  readonly message: string;
}

/** Version 1 persisted application state schema. */
export const persistedStateV1Schema = z.object({
  version: z.literal(1),
  profile: householdProfileSchema as unknown as z.ZodMiniType<HouseholdProfile>,
  language: z.enum(['en', 'hi']),
  completedActionIds: z
    .array(z.string().check(z.minLength(1), z.maxLength(80)))
    .check(z.maxLength(200)) as unknown as z.ZodMiniType<readonly string[]>,
  aiConsent: z.boolean(),
  selectedCity: z.string().check(
    z.minLength(1),
    z.maxLength(60),
    z.refine((c) => getCityById(c) !== undefined, 'Invalid city selection')
  ),
  updatedAt: z.int().check(z.positive()),
});

/** Shape of version 1 persisted state. */
export type PersistedStateV1 = z.infer<typeof persistedStateV1Schema>;
