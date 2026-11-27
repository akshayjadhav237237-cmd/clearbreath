import type { AppTranslations } from './types';

/** English translations dictionary for user interface copy. */
export const EN_TRANSLATIONS: AppTranslations = {
  appName: 'Clearbreath',
  nav: {
    airNow: 'Air Now',
    household: 'Household',
    plan: 'Daily Plan',
    actions: 'Actions',
    compare: 'Compare',
    assistant: 'AI Advisor',
    community: 'Community',
  },
  severity: {
    good: 'Good',
    satisfactory: 'Satisfactory',
    moderate: 'Moderate',
    poor: 'Poor',
    veryPoor: 'Very Poor',
    severe: 'Severe',
  },
  common: {
    ugm3: 'µg/m³',
    estimateNote:
      'Modelled estimate under stated assumptions; actual exposure varies with real-world ventilation and emission sources.',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    confidencePrefix: 'Confidence:',
    confidenceTiers: {
      low: 'Low empirical confidence',
      medium: 'Moderate empirical confidence',
      high: 'High scientific consensus',
    },
    closeDialog: 'Close dialog',
    dismissToast: 'Dismiss notification',
    errorTitle: 'Something went wrong',
    errorDesc: 'Unable to display this view. Please try refreshing the page.',
  },
  household: {
    title: 'Household Profile',
    desc: 'Customize your family members, housing envelope, and daily commute to receive tailored particulate advisories.',
    presetsTitle: 'Quick Presets',
    delhiFamily: 'Delhi-NCR Family (3 Gen)',
    puneStudent: 'Pune Student (Single)',
    mumbaiSenior: 'Mumbai Senior Couple',
    membersTitle: 'Family Members',
    homeTitle: 'Home Envelope',
    budgetTitle: 'Monthly Mitigation Budget (₹)',
  },
  airNow: {
    title: 'Ambient Air Quality',
    citySelect: 'Select City',
    pm25: 'PM2.5 (Fine Particles)',
    pm10: 'PM10 (Inhalable Particles)',
    dominant: 'Dominant Pollutant',
    liveBadge: 'Live API',
    sampleBadge: 'Simulated Data',
  },
  plan: {
    title: '24-Hour Diurnal Advisory',
    outdoorWindow: 'Optimal Outdoor Activity Window',
    purifierSchedule: 'Air Purifier Schedule',
    ventilation: 'Room-by-Room Ventilation Window',
    peakSmogWarning:
      'Severe Smog Hours: Keep windows sealed and operate purifiers.',
  },
  compare: {
    title: 'Mitigation Impact Comparison',
    baseline: 'Status Quo (No Action)',
    mitigated: 'With Planned Mitigations',
  },
  assistant: {
    title: 'AI Air Quality Assistant',
    disclaimer:
      'Advisories are grounded strictly in CPCB and EPA models. For medical symptoms, consult a doctor.',
    placeholder: 'Ask about air quality, filters, or commute safety...',
    send: 'Ask',
    consentToggle: 'Enable Cloud Gemini 3.8 Flash (Allowlist Egress)',
    modeLocal: 'Local Template Engine',
    modeGemini: 'Gemini 3.8 Flash (Grounded)',
  },
  community: {
    title: 'Neighborhood Broadcast Card',
    desc: 'Share an actionable air quality summary with your apartment WhatsApp group or Resident Welfare Association (RWA).',
    copyBroadcast: 'Copy Broadcast Text',
    copiedNotice: 'Broadcast text copied to clipboard!',
  },
} as const;
