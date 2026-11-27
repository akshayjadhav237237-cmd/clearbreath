/** Supported localization languages. */
export type Language = 'en' | 'hi';

/** Application localization dictionary structure contract. */
export interface AppTranslations {
  readonly appName: string;
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
    readonly ugm3: string;
    readonly estimateNote: string;
    readonly low: string;
    readonly medium: string;
    readonly high: string;
    readonly confidencePrefix: string;
    readonly confidenceTiers: {
      readonly low: string;
      readonly medium: string;
      readonly high: string;
    };
    readonly closeDialog: string;
    readonly dismissToast: string;
    readonly errorTitle: string;
    readonly errorDesc: string;
  };
  readonly household: {
    readonly title: string;
    readonly desc: string;
    readonly presetsTitle: string;
    readonly delhiFamily: string;
    readonly puneStudent: string;
    readonly mumbaiSenior: string;
    readonly membersTitle: string;
    readonly homeTitle: string;
    readonly budgetTitle: string;
  };
  readonly airNow: {
    readonly title: string;
    readonly citySelect: string;
    readonly pm25: string;
    readonly pm10: string;
    readonly dominant: string;
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
  readonly compare: {
    readonly title: string;
    readonly baseline: string;
    readonly mitigated: string;
  };
  readonly assistant: {
    readonly title: string;
    readonly disclaimer: string;
    readonly placeholder: string;
    readonly send: string;
    readonly consentToggle: string;
    readonly modeLocal: string;
    readonly modeGemini: string;
  };
  readonly community: {
    readonly title: string;
    readonly desc: string;
    readonly copyBroadcast: string;
    readonly copiedNotice: string;
  };
}
