import { z } from 'zod';
import type { HouseholdProfile } from '../domain/contracts';

/** Namespace key for versioned local storage state. */
export const PERSISTENCE_STORAGE_KEY = 'clearbreath_state_v1';

/** Maximum allowed payload size in bytes to prevent storage quota exhaustion. */
export const MAX_PERSISTENCE_PAYLOAD_BYTES = 102400; // 100 KB

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

const ageGroupSchema = z.enum(['infant', 'child', 'adult', 'older']);

const memberSchema = z.object({
  id: z.string().min(1),
  ageGroup: ageGroupSchema,
  respiratoryCondition: z.boolean(),
});

const homeProfileSchema = z.object({
  type: z.enum(['apartment', 'house', 'singleRoom']),
  floorAreaM2: z.number().int().positive(),
  ceilingHeightCm: z.number().int().positive(),
  sealing: z.enum(['leaky', 'average', 'tight']),
  purifierCadrM3h: z.number().int().positive().nullable(),
  hasKitchenExhaust: z.boolean(),
  cookingFuel: z.enum(['lpg', 'png', 'induction', 'biomass']),
});

const commuteSchema = z.object({
  mode: z.enum([
    'walk',
    'cycle',
    'twoWheeler',
    'car',
    'bus',
    'metro',
    'autoRickshaw',
  ]),
  distanceKm: z.number().int().nonnegative(),
  minutes: z.number().int().nonnegative(),
});

const lifestyleSchema = z.object({
  budgetRupees: z.number().int().nonnegative(),
  outdoorMinutesPerDay: z.number().int().nonnegative(),
  commute: commuteSchema,
});

/** Zod schema for complete household profile. */
export const householdProfileSchema = z.object({
  members: z.array(memberSchema).min(1),
  home: homeProfileSchema,
  lifestyle: lifestyleSchema,
});

/** Version 1 persisted application state schema. */
export const persistedStateV1Schema = z.object({
  version: z.literal(1),
  profile: householdProfileSchema as unknown as z.ZodType<HouseholdProfile>,
  language: z.enum(['en', 'hi']),
  completedActionIds: z.array(z.string()) as unknown as z.ZodType<
    readonly string[]
  >,
  aiConsent: z.boolean(),
  selectedCity: z.string().min(1),
  updatedAt: z.number().int().positive(),
});

/** Shape of version 1 persisted state. */
export type PersistedStateV1 = z.infer<typeof persistedStateV1Schema>;
