import type { AqiCategory } from '../../domain/contracts';

/** English AQI severity descriptors. */
export const EN_SEVERITY_SUMMARIES: Readonly<Record<AqiCategory, string>> = {
  good: 'Air quality is satisfactory and poses little to no risk.',
  satisfactory:
    'Air quality is acceptable with minor discomfort for sensitive people.',
  moderate:
    'Moderate pollution level; sensitive individuals may experience breathing discomfort.',
  poor: 'Air quality is poor. Prolonged exposure can trigger respiratory illness.',
  veryPoor:
    'Severe air pollution. Vulnerable household members must stay indoors.',
  severe:
    'Hazardous air emergency. Strictly seal indoors and avoid all outdoor exposure.',
};

/** English caution notes by sensitivity level. */
export const EN_CAUTION_NOTES: Readonly<Record<string, string>> = {
  high: 'High health risk: Keep children and elders inside with active air purification.',
  elevated:
    'Elevated risk: Restrict outdoor activity and operate air cleaners during peak hours.',
  low: 'Standard advisory: Close windows during evening inversion hours and monitor AQI.',
};

/** Default fallback answers for generic queries in English. */
export const EN_DEFAULT_ANSWERS = {
  general:
    'Based on your household profile and current AQI, prioritize indoor filtration and seal window gaps.',
  medicalDisclaimer:
    'Notice: Clearbreath provides non-medical environmental guidance. For acute respiratory symptoms, consult a medical doctor immediately.',
  refusal:
    'I can only provide guidance regarding air quality mitigation, home indoor air hacks, and low-emission routines based on verified domain facts.',
} as const;
