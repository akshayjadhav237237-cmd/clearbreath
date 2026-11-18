import { z } from 'zod';

/** Zod schema validating individual household member demographics. */
export const memberSchema = z.object({
  id: z.string().min(1),
  ageGroup: z.enum(['infant', 'child', 'adult', 'older']),
  respiratoryCondition: z.boolean(),
});

/** Zod schema validating commute modality and transit duration. */
export const commuteSchema = z.object({
  mode: z.enum([
    'walk',
    'cycle',
    'twoWheeler',
    'car',
    'bus',
    'metro',
    'autoRickshaw',
  ]),
  distanceKm: z.number().min(0).max(200),
  minutes: z.number().min(0).max(300),
});

/** Zod schema validating residential building physical characteristics. */
export const homeProfileSchema = z.object({
  type: z.enum(['apartment', 'house', 'singleRoom']),
  floorAreaM2: z.number().int().min(10).max(1000),
  ceilingHeightCm: z.number().int().min(200).max(500),
  sealing: z.enum(['leaky', 'average', 'tight']),
  purifierCadrM3h: z.number().min(0).max(2000).nullable(),
  hasKitchenExhaust: z.boolean(),
  cookingFuel: z.enum(['lpg', 'png', 'induction', 'biomass']),
});

/** Zod schema validating household expenditure budget and daily routines. */
export const lifestyleSchema = z.object({
  budgetRupees: z.number().int().min(0).max(1000000),
  outdoorMinutesPerDay: z.number().int().min(0).max(720),
  commute: commuteSchema,
});

/** Zod schema validating complete composite household profile. */
export const householdProfileSchema = z.object({
  members: z.array(memberSchema).min(1),
  home: homeProfileSchema,
  lifestyle: lifestyleSchema,
});
