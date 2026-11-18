/** Default household persona for Delhi-NCR winter smog scenarios. */
export const DEFAULT_HOUSEHOLD_PERSONA = {
  id: 'delhi-family-core',
  name: 'Sharma Family (Delhi-NCR)',
  members: [
    { id: 'm-parent', ageGroup: 'adult', respiratoryCondition: false },
    { id: 'm-child', ageGroup: 'child', respiratoryCondition: true },
    { id: 'm-elder', ageGroup: 'older', respiratoryCondition: true },
  ],
  home: {
    type: 'apartment',
    floorAreaM2: 90,
    ceilingHeightCm: 280,
    sealing: 'average',
    purifierCadrM3h: 250,
    hasKitchenExhaust: true,
    cookingFuel: 'png',
  },
  lifestyle: {
    budgetRupees: 5000,
    outdoorMinutesPerDay: 45,
    commute: {
      mode: 'metro',
      distanceKm: 12,
      minutes: 35,
    },
  },
} as const;
