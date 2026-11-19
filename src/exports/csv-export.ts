import type { Action, DailyPlan } from '../domain/contracts';

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

/** Generates sanitized CSV of recommended actions and quantitative impact. */
export function exportPlanCsv(
  items: readonly RecommendationExportItem[],
  plan: DailyPlan
): string {
  const headers = [
    'Action ID',
    'Category',
    'Title',
    'Effort (1-3)',
    'Cost (INR)',
    'Dose Reduction (ug/day)',
    'Dose Reduction (%)',
    'CO2e Saved (g/day)',
    'Confidence',
  ];

  const lines: string[] = [headers.map(sanitizeCsvCell).join(',')];

  for (const item of items) {
    const row = [
      item.action.id,
      item.action.category,
      item.action.title,
      item.action.effort,
      item.action.costRupees,
      item.dailyDoseReductionUg,
      (item.doseReductionBasisPoints / 100).toFixed(1),
      item.co2eSavedGramsPerDay,
      item.action.confidence,
    ];
    lines.push(row.map(sanitizeCsvCell).join(','));
  }

  lines.push('');
  lines.push(sanitizeCsvCell(`Advisory Summary: ${plan.advisorySummary}`));

  return lines.join('\r\n');
}
