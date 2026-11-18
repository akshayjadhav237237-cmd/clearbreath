import type { AqiCategory, SensitivityLevel } from '../contracts';

/** Guidance record mapping sensitivity tiers to actionable advice strings. */
type SensitivityGuidance = Record<SensitivityLevel, string>;

/** Lookup table mapping each AQI category and sensitivity tier to guidance. */
const GUIDANCE_TABLE: Record<AqiCategory, SensitivityGuidance> = {
  good: {
    low: 'Air quality is ideal. Enjoy outdoor activities and keep home ventilated with fresh air.',
    elevated:
      'Air quality is good. Normal outdoor activities and natural room ventilation are recommended.',
    high: 'Air quality is clean. Safe for all outdoor activities and daily routines.',
  },
  satisfactory: {
    low: 'Air quality is acceptable. Normal outdoor activities permitted; standard room ventilation is suitable.',
    elevated:
      'Air quality is acceptable. Consider reducing prolonged intense outdoor exertion if experiencing discomfort.',
    high: 'Air quality is acceptable. Monitor changing conditions and keep outdoor exertion moderate during smog hours.',
  },
  moderate: {
    low: 'Air quality is moderate. Plan strenuous outdoor activities away from peak traffic and smog hours.',
    elevated:
      'Air quality is moderately polluted. Limit prolonged outdoor exertion; ventilate indoors during afternoon hours.',
    high: 'Air quality is moderately polluted. Relocate intense exercise indoors and keep windows closed during smog peaks.',
  },
  poor: {
    low: 'Air quality is poor. Avoid heavy outdoor workouts during morning and late evening smog peaks.',
    elevated:
      'Air quality is poor. Avoid prolonged outdoor exposure, run indoor air filtration, and keep windows closed.',
    high: 'Air quality is poor. Minimize outdoor transit, wear a fitted N95 mask outside, and keep air purifiers running.',
  },
  veryPoor: {
    low: 'Air quality is very poor. Restrict outdoor exercise, keep windows sealed, and run indoor air purifiers.',
    elevated:
      'Air quality is very poor. Stay indoors, avoid all outdoor exertion, and use high-filtration masks if travelling.',
    high: 'Air quality is very poor. Remain indoors in sealed rooms with active air purifiers; wear fitted N95 masks outside.',
  },
  severe: {
    low: 'Air quality is severe. Avoid all outdoor physical activity, seal room gaps, and operate air cleaners continuously.',
    elevated:
      'Air quality is severe. Strictly avoid outdoor exposure, remain in a purified clean-room space, and run purifiers.',
    high: 'Air quality is severe. Emergency conditions: remain indoors in purified spaces, avoid outdoor transit, and seal rooms.',
  },
};

/** Resolves actionable safety guidance for a given AQI category and sensitivity level. */
export function getAqiGuidance(
  category: AqiCategory,
  sensitivity: SensitivityLevel
): string {
  const categoryGuidance = GUIDANCE_TABLE[category];
  if (!categoryGuidance) {
    return 'Monitor local air quality advisories and adjust outdoor exposure accordingly.';
  }
  const advice = categoryGuidance[sensitivity];
  return (
    advice ??
    'Monitor local air quality advisories and adjust outdoor exposure accordingly.'
  );
}
