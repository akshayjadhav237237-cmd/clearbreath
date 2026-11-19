import type { HouseholdProfile } from '../domain/contracts';
import { DEFAULT_HOUSEHOLD_PERSONA } from './persona';

/** Available demographic persona preset keys. */
export type PresetKey =
  'delhiFamily' | 'puneStudent' | 'mumbaiSenior' | 'custom';

/** Curated reference household presets for demographic scenario simulation. */
export const PRESETS: Record<
  'delhiFamily' | 'puneStudent' | 'mumbaiSenior',
  HouseholdProfile
> = {
  delhiFamily: DEFAULT_HOUSEHOLD_PERSONA,
  puneStudent: {
    members: [
      { id: 'mem-student-1', ageGroup: 'adult', respiratoryCondition: false },
    ],
    home: {
      type: 'singleRoom',
      floorAreaM2: 25,
      ceilingHeightCm: 260,
      sealing: 'leaky',
      purifierCadrM3h: null,
      hasKitchenExhaust: false,
      cookingFuel: 'induction',
    },
    lifestyle: {
      budgetRupees: 800,
      outdoorMinutesPerDay: 90,
      commute: { mode: 'twoWheeler', distanceKm: 8, minutes: 25 },
    },
  },
  mumbaiSenior: {
    members: [
      { id: 'mem-senior-1', ageGroup: 'older', respiratoryCondition: true },
      { id: 'mem-senior-2', ageGroup: 'older', respiratoryCondition: false },
    ],
    home: {
      type: 'apartment',
      floorAreaM2: 75,
      ceilingHeightCm: 280,
      sealing: 'tight',
      purifierCadrM3h: 200,
      hasKitchenExhaust: true,
      cookingFuel: 'png',
    },
    lifestyle: {
      budgetRupees: 2500,
      outdoorMinutesPerDay: 30,
      commute: { mode: 'walk', distanceKm: 2, minutes: 30 },
    },
  },
};
