import type { Language } from './types';

/** Localized UI strings, units, and templates for the Compare feature. */
export interface CompareTranslations {
  readonly subtitle: string;
  readonly doseBadgeLabel: string;
  readonly actionsImplementedTemplate: string;
  readonly liveContextTemplate: string;
  readonly baselineSubtitle: string;
  readonly baselineIndoorLabel: string;
  readonly baselineIndoorTooltip: string;
  readonly baselineDoseLabel: string;
  readonly baselineDoseTooltip: string;
  readonly baselineCostLabel: string;
  readonly baselineCostTooltip: string;
  readonly mitigatedSubtitleTemplate: string;
  readonly mitigatedIndoorLabel: string;
  readonly mitigatedDoseLabel: string;
  readonly mitigatedCostLabel: string;
  readonly noActionsHint: string;
  readonly units: {
    readonly ugm3: string;
    readonly ugPerDay: string;
    readonly gPerDay: string;
    readonly co2eSavedSuffix: string;
    readonly rupeeSymbol: string;
  };
  readonly pickerTitle: string;
  readonly pickerSubtitle: string;
  readonly pickerContextTemplate: string;
  readonly choiceALabel: string;
  readonly choiceBLabel: string;
  readonly doseDeltaLabel: string;
  readonly emissionsDeltaLabel: string;
  readonly verdictLabel: string;
  readonly doseWinnerTemplate: string;
  readonly doseTieText: string;
  readonly emissionsWinnerTemplate: string;
  readonly emissionsTieText: string;
  readonly assumptionsHeader: string;
  readonly estimateDisclosureTitle: string;
  readonly estimateDisclosure: string;
}

const EN_COMPARE: CompareTranslations = {
  subtitle:
    'Compare modelled status quo and mitigated household exposure estimates under stated IAQ assumptions.',
  doseBadgeLabel: 'Total Inhaled Dose',
  actionsImplementedTemplate: 'Based on {n} actions implemented',
  liveContextTemplate: 'Live AQI {aqi} • Outdoor PM2.5: {pm25} µg/m³',
  baselineSubtitle: 'Without active interventions',
  baselineIndoorLabel: 'Average Indoor PM2.5',
  baselineIndoorTooltip: 'Steady-state indoor particulate concentration',
  baselineDoseLabel: 'Total Daily Inhaled Dose',
  baselineDoseTooltip: 'Estimated across household members',
  baselineCostLabel: 'Implementation Cost',
  baselineCostTooltip: 'Baseline expenditure',
  mitigatedSubtitleTemplate: 'With {n} planned mitigations applied',
  mitigatedIndoorLabel: 'Mitigated Indoor PM2.5',
  mitigatedDoseLabel: 'Mitigated Inhaled Dose',
  mitigatedCostLabel: 'Total Implementation Cost',
  noActionsHint:
    'Mark actions as implemented in the Actions tab to quantify household savings.',
  units: {
    ugm3: 'µg/m³',
    ugPerDay: 'µg/day',
    gPerDay: 'g/day',
    co2eSavedSuffix: 'g CO2e saved',
    rupeeSymbol: '₹',
  },
  pickerTitle: 'Head-to-Head Action Comparison',
  pickerSubtitle:
    'Compare inhaled dose reduction and daily carbon savings between two actions under live city PM2.5 and household context.',
  pickerContextTemplate:
    'Live context: {pm25} µg/m³ outdoor PM2.5 • {area} m² ({sealing}) • {km} km commute',
  choiceALabel: 'Option A',
  choiceBLabel: 'Option B',
  doseDeltaLabel: 'Inhaled Dose Difference (A vs B)',
  emissionsDeltaLabel: 'Daily CO2e Difference (A vs B)',
  verdictLabel: 'Comparison Verdict',
  doseWinnerTemplate:
    '"{winner}" delivers {amount} µg/day greater dose reduction',
  doseTieText: 'Both actions deliver equivalent daily dose reduction',
  emissionsWinnerTemplate: '"{winner}" saves {amount} g/day more CO2e',
  emissionsTieText: 'Both actions deliver equivalent daily CO2e savings',
  assumptionsHeader: 'Stated Model Assumptions',
  estimateDisclosureTitle: 'Modelled Estimate Disclosure',
  estimateDisclosure:
    'Figures reflect live city AQI and household profile inputs under stated mass-balance assumptions rather than clinical measurement.',
};

const HI_COMPARE: CompareTranslations = {
  subtitle:
    'निर्दिष्ट आंतरिक वायु गुणवत्ता मान्यताओं के अंतर्गत वर्तमान स्थिति और प्रस्तावित उपायों के पारिवारिक जोखिम अनुमान की तुलना करें।',
  doseBadgeLabel: 'कुल सांस खुराक',
  actionsImplementedTemplate: 'लागू किए गए {n} उपायों के आधार पर',
  liveContextTemplate:
    'लाइव एक्यूआई {aqi} • बाहरी पीएम 2.5: {pm25} माइक्रोग्राम/मी³',
  baselineSubtitle: 'सक्रिय उपायों के बिना',
  baselineIndoorLabel: 'औसत आंतरिक पीएम 2.5',
  baselineIndoorTooltip: 'स्थिर अवस्था में घर के भीतर सूक्ष्म कण सांद्रता',
  baselineDoseLabel: 'दैनिक कुल सांस खुराक',
  baselineDoseTooltip: 'सभी पारिवारिक सदस्यों के लिए अनुमानित',
  baselineCostLabel: 'कार्यान्वयन लागत',
  baselineCostTooltip: 'वर्तमान स्थिति का व्यय',
  mitigatedSubtitleTemplate: '{n} योजनाबद्ध उपायों के साथ',
  mitigatedIndoorLabel: 'उपायों के बाद आंतरिक पीएम 2.5',
  mitigatedDoseLabel: 'उपायों के बाद सांस खुराक',
  mitigatedCostLabel: 'कुल कार्यान्वयन लागत',
  noActionsHint:
    'पारिवारिक लाभ देखने के लिए उपाय टैब में उपाय लागू चिह्नित करें।',
  units: {
    ugm3: 'माइक्रोग्राम/मी³',
    ugPerDay: 'माइक्रोग्राम/दिन',
    gPerDay: 'ग्राम/दिन',
    co2eSavedSuffix: 'ग्राम CO2e की बचत',
    rupeeSymbol: '₹',
  },
  pickerTitle: 'दो उपायों की सीधी तुलना',
  pickerSubtitle:
    'वर्तमान शहर के पीएम 2.5 और घर के विवरण के आधार पर किन्हीं दो उपायों की सांस खुराक और दैनिक कार्बन बचत की तुलना करें।',
  pickerContextTemplate:
    'लाइव संदर्भ: {pm25} माइक्रोग्राम/मी³ बाहरी पीएम 2.5 • {area} वर्ग मी. ({sealing}) • {km} किमी यात्रा',
  choiceALabel: 'विकल्प ए',
  choiceBLabel: 'विकल्प बी',
  doseDeltaLabel: 'सांस खुराक अंतर (ए बनाम बी)',
  emissionsDeltaLabel: 'दैनिक CO2e अंतर (ए बनाम बी)',
  verdictLabel: 'तुलना निष्कर्ष',
  doseWinnerTemplate:
    '"{winner}" प्रतिदिन {amount} माइक्रोग्राम/दिन अधिक खुराक कम करता है',
  doseTieText: 'दोनों उपाय समान दैनिक सांस खुराक में कमी देते हैं',
  emissionsWinnerTemplate:
    '"{winner}" प्रतिदिन {amount} ग्राम/दिन अधिक CO2e बचाता है',
  emissionsTieText: 'दोनों उपायों का दैनिक CO2e प्रभाव समान है',
  assumptionsHeader: 'मॉडल की निर्दिष्ट मान्यताएं',
  estimateDisclosureTitle: 'मॉडल अनुमान प्रकटीकरण',
  estimateDisclosure:
    'ये आंकड़े प्रत्यक्ष नैदानिक माप के बजाय वर्तमान शहर के लाइव एक्यूआई और परिवार प्रोफाइल पर आधारित मॉडल अनुमान हैं।',
};

/** Returns localized English or Hindi strings and units for the Compare panel. */
export function getCompareTranslations(lang: Language): CompareTranslations {
  return lang === 'hi' ? HI_COMPARE : EN_COMPARE;
}
