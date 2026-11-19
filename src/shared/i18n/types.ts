/** Supported localization languages. */
export type Language = 'en' | 'hi';

/** Application localization dictionary structure contract. */
export interface AppTranslations {
  readonly appName: string;
  readonly tagline: string;
  readonly nav: {
    readonly airNow: string;
    readonly household: string;
    readonly plan: string;
    readonly actions: string;
    readonly compare: string;
    readonly assistant: string;
    readonly community: string;
  };
  readonly severity: {
    readonly good: string;
    readonly satisfactory: string;
    readonly moderate: string;
    readonly poor: string;
    readonly veryPoor: string;
    readonly severe: string;
  };
  readonly common: {
    readonly done: string;
    readonly active: string;
    readonly save: string;
    readonly reset: string;
    readonly cost: string;
    readonly effort: string;
    readonly rupees: string;
    readonly ugm3: string;
    readonly source: string;
    readonly low: string;
    readonly medium: string;
    readonly high: string;
  };
  readonly household: {
    readonly title: string;
    readonly desc: string;
    readonly presetsTitle: string;
    readonly delhiFamily: string;
    readonly puneStudent: string;
    readonly mumbaiSenior: string;
    readonly membersTitle: string;
    readonly addMember: string;
    readonly homeTitle: string;
    readonly budgetTitle: string;
    readonly commuteTitle: string;
  };
  readonly airNow: {
    readonly title: string;
    readonly citySelect: string;
    readonly pm25: string;
    readonly pm10: string;
    readonly dominant: string;
    readonly attribution: string;
    readonly liveBadge: string;
    readonly sampleBadge: string;
  };
  readonly plan: {
    readonly title: string;
    readonly outdoorWindow: string;
    readonly purifierSchedule: string;
    readonly ventilation: string;
    readonly peakSmogWarning: string;
  };
  readonly actions: {
    readonly title: string;
    readonly filterAll: string;
    readonly doneToday: string;
    readonly avoidedDose: string;
    readonly avoidedCo2: string;
    readonly markDone: string;
  };
  readonly compare: {
    readonly title: string;
    readonly baseline: string;
    readonly mitigated: string;
    readonly doseReduction: string;
    readonly costSummary: string;
    readonly emissionsSaved: string;
  };
  readonly assistant: {
    readonly title: string;
    readonly disclaimer: string;
    readonly placeholder: string;
    readonly send: string;
    readonly consentToggle: string;
    readonly consentNote: string;
    readonly modeLocal: string;
    readonly modeGemini: string;
    readonly showFacts: string;
  };
  readonly community: {
    readonly title: string;
    readonly desc: string;
    readonly copyBroadcast: string;
    readonly copiedNotice: string;
  };
}
