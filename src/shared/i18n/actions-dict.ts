import type { Language } from './types';

/** Localized copy dictionary for Recommendations, Actions, and Why This? provenance UI. */
export interface ActionsDict {
  readonly heading: string;
  readonly subtitle: string;
  readonly categoryNavAriaLabel: string;
  readonly categories: {
    readonly all: string;
    readonly indoor: string;
    readonly mobility: string;
    readonly outdoor: string;
    readonly household: string;
    readonly community: string;
  };
  readonly summary: {
    readonly avoidedDoseLabel: string;
    readonly avoidedDoseUnit: string;
    readonly actionsAppliedSuffix: string;
    readonly avoidedCo2Label: string;
    readonly avoidedCo2Unit: string;
    readonly communityBenefit: string;
    readonly liveContextPrefix: string;
    readonly aqiLabel: string;
  };
  readonly card: {
    readonly costLabel: string;
    readonly effortLabel: string;
    readonly effortScaleSuffix: string;
    readonly implementedTodayBadge: string;
    readonly doseSavedLabel: string;
    readonly doseSavedUnit: string;
    readonly co2SavedLabel: string;
    readonly co2SavedUnit: string;
    readonly markImplementedBtn: string;
    readonly completedBtn: string;
    readonly confidenceLabel: string;
    readonly confidenceLevels: {
      readonly low: string;
      readonly medium: string;
      readonly high: string;
    };
  };
  readonly whyThis: {
    readonly toggleBtn: string;
    readonly drawerHeading: string;
    readonly doseImpactLabel: string;
    readonly relativeReductionLabel: string;
    readonly co2ImpactLabel: string;
    readonly formulaIdLabel: string;
    readonly assumptionsHeading: string;
    readonly sourcesHeading: string;
    readonly estimateDisclaimer: string;
    readonly fallbackOrg: string;
    readonly noSourcesNote: string;
  };
  readonly emptyCategory: string;
}

const EN_ACTIONS: ActionsDict = {
  heading: 'Mitigation Actions',
  subtitle:
    'Prioritized by estimated cost-effectiveness (modelled inhaled dose reduction per rupee spent).',
  categoryNavAriaLabel: 'Action categories',
  categories: {
    all: 'All',
    indoor: 'Indoor',
    mobility: 'Mobility',
    outdoor: 'Outdoor',
    household: 'Household',
    community: 'Community',
  },
  summary: {
    avoidedDoseLabel: 'Daily Avoided Inhaled Dose',
    avoidedDoseUnit: 'µg / day',
    actionsAppliedSuffix: 'actions applied',
    avoidedCo2Label: 'Carbon Emissions Prevented',
    avoidedCo2Unit: 'g CO2e / day',
    communityBenefit: 'Community benefit',
    liveContextPrefix: 'Quantified for',
    aqiLabel: 'AQI',
  },
  card: {
    costLabel: 'Cost',
    effortLabel: 'Effort',
    effortScaleSuffix: '/3',
    implementedTodayBadge: '✓ IMPLEMENTED TODAY',
    doseSavedLabel: 'Dose Saved',
    doseSavedUnit: 'µg/day',
    co2SavedLabel: 'CO2e Saved',
    co2SavedUnit: 'g CO2e/day',
    markImplementedBtn: '+ Mark as Implemented',
    completedBtn: '✓ Completed',
    confidenceLabel: 'Confidence',
    confidenceLevels: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
  },
  whyThis: {
    toggleBtn: 'Why this?',
    drawerHeading: 'Model Provenance & Evidence',
    doseImpactLabel: 'Estimated Daily Dose Reduction',
    relativeReductionLabel: 'Relative Household Reduction',
    co2ImpactLabel: 'Estimated Daily Carbon Reduction',
    formulaIdLabel: 'Formula ID',
    assumptionsHeading: 'Key Modelling Assumptions',
    sourcesHeading: 'Scientific & Regulatory Sources',
    estimateDisclaimer:
      'Modelled estimate under stated assumptions; actual exposure varies with real-world ventilation and emission sources.',
    fallbackOrg: 'Scientific Reference',
    noSourcesNote:
      'Derived from core residential exposure and CPCB NAQI models.',
  },
  emptyCategory:
    'No eligible actions found for this category with your current household profile.',
};

const HI_ACTIONS: ActionsDict = {
  heading: 'प्रदूषण रोकथाम उपाय',
  subtitle:
    'अनुमानित लागत-प्रभावशीलता (प्रति रुपये खर्च पर मॉडल की गई सांस खुराक में कमी) के आधार पर क्रमबद्ध।',
  categoryNavAriaLabel: 'उपाय श्रेणियां',
  categories: {
    all: 'सभी',
    indoor: 'घर के अंदर',
    mobility: 'यातायात',
    outdoor: 'बाहरी',
    household: 'घरेलू',
    community: 'सामुदायिक',
  },
  summary: {
    avoidedDoseLabel: 'बचाव की गई दैनिक सांस खुराक',
    avoidedDoseUnit: 'µg / दिन',
    actionsAppliedSuffix: 'उपाय लागू किए गए',
    avoidedCo2Label: 'रोकी गई कार्बन उत्सर्जन मात्रा',
    avoidedCo2Unit: 'g CO2e / दिन',
    communityBenefit: 'सामुदायिक लाभ',
    liveContextPrefix: 'गणना आधार',
    aqiLabel: 'एक्यूआई',
  },
  card: {
    costLabel: 'लागत',
    effortLabel: 'प्रयास',
    effortScaleSuffix: '/3',
    implementedTodayBadge: '✓ आज लागू किया गया',
    doseSavedLabel: 'बचाई गई खुराक',
    doseSavedUnit: 'µg/दिन',
    co2SavedLabel: 'बचाया गया CO2e',
    co2SavedUnit: 'g CO2e/दिन',
    markImplementedBtn: '+ लागू किया गया चिह्नित करें',
    completedBtn: '✓ पूर्ण हुआ',
    confidenceLabel: 'विश्वास स्तर',
    confidenceLevels: {
      low: 'कम',
      medium: 'मध्यम',
      high: 'उच्च',
    },
  },
  whyThis: {
    toggleBtn: 'यह क्यों?',
    drawerHeading: 'मॉडल प्रमाण और स्रोत विवरण',
    doseImpactLabel: 'अनुमानित दैनिक खुराक में कमी',
    relativeReductionLabel: 'सापेक्ष घरेलू कमी',
    co2ImpactLabel: 'अनुमानित दैनिक कार्बन कमी',
    formulaIdLabel: 'सूत्र आईडी',
    assumptionsHeading: 'प्रमुख मॉडलिंग मान्यताएं',
    sourcesHeading: 'वैज्ञानिक और नियामक स्रोत',
    estimateDisclaimer:
      'निर्दिष्ट मान्यताओं के अंतर्गत मॉडल किया गया अनुमान; वास्तविक जोखिम वेंटिलेशन और उत्सर्जन स्रोतों के अनुसार बदल सकता है।',
    fallbackOrg: 'वैज्ञानिक संदर्भ',
    noSourcesNote: 'मुख्य आवासीय जोखिम और CPCB NAQI मॉडल से व्युत्पन्न।',
  },
  emptyCategory:
    'आपकी वर्तमान परिवार प्रोफाइल के लिए इस श्रेणी में कोई उपयुक्त उपाय नहीं मिला।',
};

/** Returns localized English or Hindi strings for the recommendations and actions UI. */
export function getActionsDict(language: Language): ActionsDict {
  return language === 'hi' ? HI_ACTIONS : EN_ACTIONS;
}
