/** Item specification in the privacy disclosure table. */
export interface DisclosureItem {
  readonly field: string;
  readonly whySent: string;
  readonly exampleValue: string;
}

/** Complete allowlist definition of fields shared with external AI providers. */
export const PRIVACY_DISCLOSURE_ALLOWLIST: readonly DisclosureItem[] = [
  {
    field: 'city',
    whySent: 'Selects local climatological and baseline AQI parameters.',
    exampleValue: 'Delhi',
  },
  {
    field: 'aqiCategory',
    whySent: 'Directs severity and urgency of outdoor activity advisories.',
    exampleValue: 'severe',
  },
  {
    field: 'aqiValue',
    whySent: 'Provides ambient diurnal particulate index.',
    exampleValue: '430',
  },
  {
    field: 'sensitivityLevel',
    whySent: 'Calibrates vulnerability threshold for elder and child guidance.',
    exampleValue: 'high',
  },
  {
    field: 'ageGroupsPresent',
    whySent:
      'Ensures tailored protective guidance without exposing member identities.',
    exampleValue: '["child", "older"]',
  },
  {
    field: 'homeType',
    whySent: 'Informs dwelling infiltration estimates.',
    exampleValue: 'apartment',
  },
  {
    field: 'sealing',
    whySent: 'Determines building envelope air exchange rate.',
    exampleValue: 'average',
  },
  {
    field: 'cookingFuel',
    whySent: 'Evaluates indoor combustion particulate sources.',
    exampleValue: 'png',
  },
  {
    field: 'commuteMode',
    whySent: 'Identifies transit exposure and carbon mitigation opportunities.',
    exampleValue: 'metro',
  },
  {
    field: 'budgetBand',
    whySent:
      'Filters viable intervention actions without revealing financial details.',
    exampleValue: 'medium',
  },
  {
    field: 'language',
    whySent: 'Instructs response language preference.',
    exampleValue: 'en',
  },
  {
    field: 'facts',
    whySent:
      'Supplies verified mathematical and catalog evidence to prevent hallucinations.',
    exampleValue: '[{ id: "act-indoor-seal-gaps", ... }]',
  },
  {
    field: 'question',
    whySent:
      'Transmits sanitized question text only when user submits a query.',
    exampleValue: 'Should we run the purifier tonight?',
  },
];

/** Renders the privacy disclosure specification as a formatted Markdown table. */
export function renderPrivacyDisclosureMarkdown(): string {
  const header = '| Field | Purpose | Example |\n| --- | --- | --- |\n';
  const rows = PRIVACY_DISCLOSURE_ALLOWLIST.map(
    (item) =>
      `| \`${item.field}\` | ${item.whySent} | \`${item.exampleValue}\` |`
  ).join('\n');
  return `${header}${rows}\n`;
}
