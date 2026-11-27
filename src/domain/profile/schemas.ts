import * as z from 'zod/mini';

/** Zod schema validating individual household member demographics. */
export const memberSchema = z.object({
  id: z.string().check(z.minLength(1), z.maxLength(64)),
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
  distanceKm: z.number().check(z.minimum(0), z.maximum(200)),
  minutes: z.number().check(z.minimum(0), z.maximum(300)),
});

/** Zod schema validating residential building physical characteristics. */
export const homeProfileSchema = z.object({
  type: z.enum(['apartment', 'house', 'singleRoom']),
  floorAreaM2: z.int().check(z.minimum(10), z.maximum(1000)),
  ceilingHeightCm: z.int().check(z.minimum(200), z.maximum(500)),
  sealing: z.enum(['leaky', 'average', 'tight']),
  purifierCadrM3h: z.nullable(z.number().check(z.minimum(0), z.maximum(2000))),
  hasKitchenExhaust: z.boolean(),
  cookingFuel: z.enum(['lpg', 'png', 'induction', 'biomass']),
});

/** Zod schema validating household expenditure budget and daily routines. */
export const lifestyleSchema = z.object({
  budgetRupees: z.int().check(z.minimum(0), z.maximum(1000000)),
  outdoorMinutesPerDay: z.int().check(z.minimum(0), z.maximum(720)),
  commute: commuteSchema,
});

/** Zod schema validating complete composite household profile. */
export const householdProfileSchema = z.object({
  members: z.array(memberSchema).check(z.minLength(1), z.maxLength(20)),
  home: homeProfileSchema,
  lifestyle: lifestyleSchema,
});
