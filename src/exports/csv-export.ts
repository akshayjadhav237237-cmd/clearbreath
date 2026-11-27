import type { Action, DailyPlan } from '../domain/contracts';
import type { Language } from '../shared/i18n';
import { translatePlanAdvisory } from '../shared/i18n/catalog-hi';
import { translateActionTitle } from '../shared/i18n/compare-action-titles';
import { getPlanDict } from '../shared/i18n/plan-dict';

/** Single recommendation row item formatted for export. */
export interface RecommendationExportItem {
  readonly action: Action;
  readonly dailyDoseReductionUg: number;
  readonly doseReductionBasisPoints: number;
  readonly co2eSavedGramsPerDay: number;
}

const INJECTION_PREFIXES = ['=', '+', '-', '@', '\t', '\r'] as const;

/** Sanitizes cell content against spreadsheet formula injection and CSV quoting rules. */
export function sanitizeCsvCell(value: string | number | boolean): string {
  const str = String(value);
  let guarded = str;

  const firstChar = str.charAt(0);
  if (
    INJECTION_PREFIXES.includes(
      firstChar as (typeof INJECTION_PREFIXES)[number]
    )
  ) {
    guarded = `'${str}`;
  }

  if (
    guarded.includes(',') ||
    guarded.includes('"') ||
    guarded.includes('\n') ||
    guarded.includes('\r')
  ) {
    return `"${guarded.replace(/"/g, '""')}"`;
  }

  return guarded;
}

const EN_CSV_HEADERS = [
  'Action ID',
  'Category',
  'Title',
  'Effort (1-3)',
  'Cost (INR)',
  'Dose Reduction (ug/day)',
  'Dose Reduction (%)',
  'CO2e Saved (g/day)',
  'Confidence',
] as const;

const HI_CSV_HEADERS = [
  'उपाय आईडी',
  'श्रेणी',
  'शीर्षक',
  'प्रयास (1-3)',
  'लागत (₹)',
  'सांस खुराक बचाव (माइक्रोग्राम/दिन)',
  'खुराक कमी (%)',
  'CO2e बचत (ग्राम/दिन)',
  'विश्वसनीयता',
] as const;

const HI_CONFIDENCE: Readonly<Record<string, string>> = {
  low: 'कम',
  medium: 'मध्यम',
  high: 'उच्च',
};

/** Generates sanitized CSV of recommended actions and quantitative impact. */
export function exportPlanCsv(
  items: readonly RecommendationExportItem[],
  plan: DailyPlan,
  language: Language = 'en'
): string {
  const dict = getPlanDict(language);
  const headers = language === 'hi' ? HI_CSV_HEADERS : EN_CSV_HEADERS;
  const lines: string[] = [headers.map(sanitizeCsvCell).join(',')];

  for (const item of items) {
    const category =
      language === 'hi'
        ? dict.categories[item.action.category]
        : item.action.category;
    const confidence =
      language === 'hi'
        ? (HI_CONFIDENCE[item.action.confidence] ?? item.action.confidence)
        : item.action.confidence;
    const row = [
      item.action.id,
      category,
      translateActionTitle(item.action.id, item.action.title, language),
      item.action.effort,
      item.action.costRupees,
      item.dailyDoseReductionUg,
      (item.doseReductionBasisPoints / 100).toFixed(1),
      item.co2eSavedGramsPerDay,
      confidence,
    ];
    lines.push(row.map(sanitizeCsvCell).join(','));
  }

  lines.push('');
  const advPrefix = language === 'hi' ? 'परामर्श सारांश' : 'Advisory Summary';
  const summaryText = translatePlanAdvisory(plan.advisorySummary, language);
  lines.push(sanitizeCsvCell(`${advPrefix}: ${summaryText}`));

  return lines.join('\r\n');
}
