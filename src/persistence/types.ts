import { z } from 'zod';
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
  profile: householdProfileSchema as unknown as z.ZodType<HouseholdProfile>,
  language: z.enum(['en', 'hi']),
  completedActionIds: z
    .array(z.string().min(1).max(80))
    .max(200) as unknown as z.ZodType<readonly string[]>,
  aiConsent: z.boolean(),
  selectedCity: z
    .string()
    .min(1)
    .max(60)
    .refine((c) => getCityById(c) !== undefined, 'Invalid city selection'),
  updatedAt: z.number().int().positive(),
});

/** Shape of version 1 persisted state. */
export type PersistedStateV1 = z.infer<typeof persistedStateV1Schema>;
