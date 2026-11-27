import type { Language } from './types';

const EN_PLAN_DICT = {
  panel: {
    subtitle:
      'Lower-pollution outdoor windows, ventilation slots, and purifier schedules derived from diurnal AQI trends and household sensitivity.',
  },
  chart: {
    profilePm25: '24h Diurnal Particulate Profile (PM2.5)',
    profileAqi: '24h Diurnal AQI Profile',
    peakLabel: 'Peak',
    aqiUnit: 'AQI',
    ugM3Unit: 'µg/m³',
  },
  metrics: {
    lowestAqiBadge: 'LOWEST AQI WINDOW',
    stayIndoors: 'Stay Indoors',
    averageAqiLabel: 'Average AQI:',
    crossVentBadge: 'CROSS VENTILATION',
    minutesUnit: 'Minutes',
    sealedLabel: 'Sealed',
    windowLabel: 'Window:',
    keepWindowsShut: 'Keep windows shut',
    hepaCadrBadge: 'HEPA CADR',
    hoursHighUnit: 'Hours High',
    nightInversionLabel: 'Night Inversion:',
    nightInversionNote: 'High speed during inversion hours',
  },
  exports: {
    heading: 'Export & Print Routine',
    subtitle:
      'Save schedule to calendar, export CSV data, or print family advisory card.',
    exportCsv: 'Export CSV',
    exportCalendar: 'Export Calendar',
    backupProfile: 'Backup Profile',
    restoreProfile: 'Restore Profile',
    printFamilyPlan: 'Print Family Plan',
    uploadAriaLabel: 'Upload JSON Profile Backup',
    csvDownloaded: 'Plan CSV downloaded successfully.',
    icsDownloaded: 'Calendar schedule ICS downloaded successfully.',
    jsonDownloaded: 'Household profile JSON downloaded successfully.',
    profileImported: 'Profile imported.',
    importErrorPrefix: 'Import error:',
    maxFileSizeError: 'Import file exceeds maximum allowed size (50 KiB)',
    readFileError: 'Failed to read import file.',
    invalidFileContent: 'Invalid file content.',
  },
  print: {
    title: 'Clearbreath • Smog-Day Family Action Plan',
    generatedOn: 'Generated on:',
    householdMembers: 'Household Members:',
    printActionPlan: 'Print Action Plan',
    airQualityStatus: 'Air Quality Status',
    aqiPrefix: 'AQI',
    priorityHeading: 'Priority Household Interventions',
    colAction: 'Action',
    colCategory: 'Category',
    colEffort: 'Effort',
    colCost: 'Cost',
    effortPrefix: 'Effort',
    ventilationWindow: 'Ventilation Window',
    keepWindowsClosed: 'Keep windows closed during smog hours',
    purifierRoutine: 'Purifier Routine',
    purifierNightBoost: 'High speed 21:00 - 23:00 prior to sleep',
    scientificBasis:
      'Scientific Basis: CPCB NAQI 2014, EPA Mass-Balance IAQ, WHO AQG 2021.',
    disclaimer:
      'Disclaimer: Clearbreath provides algorithmic exposure reduction advisories and does not offer clinical medical guidance.',
  },
  severity: {
    good: 'GOOD',
    satisfactory: 'SATISFACTORY',
    moderate: 'MODERATE',
    poor: 'POOR',
    veryPoor: 'VERY POOR',
    severe: 'SEVERE',
  },
  categories: {
    indoor: 'indoor',
    mobility: 'mobility',
    outdoor: 'outdoor',
    household: 'household',
    community: 'community',
  },
};

/** Localization dictionary shape for Plan, Chart, Metrics, Exports, and Print views. */
export type PlanDict = typeof EN_PLAN_DICT;

const HI_PLAN_DICT: PlanDict = {
  panel: {
    subtitle:
      'दैनिक एक्यूआई रुझानों और परिवार की संवेदनशीलता के आधार पर कम प्रदूषण वाला बाहरी समय, वेंटिलेशन स्लॉट और एयर प्यूरीफायर शेड्यूल।',
  },
  chart: {
    profilePm25: '24-घंटे का सूक्ष्म कण चक्र (PM2.5)',
    profileAqi: '24-घंटे का दैनिक एक्यूआई चक्र',
    peakLabel: 'शिखर',
    aqiUnit: 'एक्यूआई',
    ugM3Unit: 'µg/m³',
  },
  metrics: {
    lowestAqiBadge: 'न्यूनतम एक्यूआई समय',
    stayIndoors: 'घर के अंदर रहें',
    averageAqiLabel: 'औसत एक्यूआई:',
    crossVentBadge: 'क्रॉस वेंटिलेशन',
    minutesUnit: 'मिनट',
    sealedLabel: 'बंद रखें',
    windowLabel: 'समय:',
    keepWindowsShut: 'खिड़कियां बंद रखें',
    hepaCadrBadge: 'HEPA CADR',
    hoursHighUnit: 'घंटे हाई मोड',
    nightInversionLabel: 'रात्रि स्मॉग स्तर:',
    nightInversionNote: 'प्रदूषण चरम घंटों में हाई स्पीड पर चलाएं',
  },
  exports: {
    heading: 'निर्यात एवं प्रिंट दिनचर्या',
    subtitle:
      'शेड्यूल को कैलेंडर में सहेजें, CSV डेटा निर्यात करें, या पारिवारिक परामर्श कार्ड प्रिंट करें।',
    exportCsv: 'CSV निर्यात करें',
    exportCalendar: 'कैलेंडर निर्यात करें',
    backupProfile: 'प्रोफाइल बैकअप लें',
    restoreProfile: 'प्रोफाइल रीस्टोर करें',
    printFamilyPlan: 'पारिवारिक योजना प्रिंट करें',
    uploadAriaLabel: 'JSON प्रोफाइल बैकअप अपलोड करें',
    csvDownloaded: 'योजना CSV सफलतापूर्वक डाउनलोड हो गई।',
    icsDownloaded: 'कैलेंडर शेड्यूल ICS सफलतापूर्वक डाउनलोड हो गया।',
    jsonDownloaded: 'परिवार प्रोफाइल JSON सफलतापूर्वक डाउनलोड हो गई।',
    profileImported: 'प्रोफाइल सफलतापूर्वक आयात हो गई।',
    importErrorPrefix: 'आयात त्रुटि:',
    maxFileSizeError: 'आयात फ़ाइल अधिकतम अनुमत आकार (50 KiB) से अधिक है',
    readFileError: 'आयात फ़ाइल पढ़ने में विफल।',
    invalidFileContent: 'अमान्य फ़ाइल सामग्री।',
  },
  print: {
    title: 'क्लियरब्रेथ • स्मॉग-दिवस पारिवारिक कार्य योजना',
    generatedOn: 'तैयार की गई तिथि:',
    householdMembers: 'परिवार के सदस्य:',
    printActionPlan: 'कार्य योजना प्रिंट करें',
    airQualityStatus: 'वायु गुणवत्ता स्थिति',
    aqiPrefix: 'एक्यूआई',
    priorityHeading: 'प्रमुख पारिवारिक बचाव उपाय',
    colAction: 'उपाय',
    colCategory: 'श्रेणी',
    colEffort: 'प्रयास',
    colCost: 'लागत',
    effortPrefix: 'प्रयास',
    ventilationWindow: 'वेंटिलेशन समय',
    keepWindowsClosed: 'स्मॉग के घंटों में खिड़कियां बंद रखें',
    purifierRoutine: 'प्यूरीफायर दिनचर्या',
    purifierNightBoost: 'सोने से पहले 21:00 - 23:00 हाई स्पीड पर चलाएं',
    scientificBasis:
      'वैज्ञानिक आधार: CPCB NAQI 2014, EPA मास-बैलेंस IAQ, WHO AQG 2021।',
    disclaimer:
      'अस्वीकरण: क्लियरब्रेथ केवल मॉडल-आधारित प्रदूषण जोखिम कम करने का परामर्श देता है और चिकित्सीय सलाह प्रदान नहीं करता है।',
  },
  severity: {
    good: 'अच्छा',
    satisfactory: 'संतोषजनक',
    moderate: 'मध्यम',
    poor: 'खराब',
    veryPoor: 'बहुत खराब',
    severe: 'गंभीर',
  },
  categories: {
    indoor: 'इनडोर',
    mobility: 'आवागमन',
    outdoor: 'बाहरी',
    household: 'घरेलू',
    community: 'सामुदायिक',
  },
};

/** Returns localized Plan, Chart, Metrics, Exports, and Print copy for a language. */
export function getPlanDict(lang: Language): PlanDict {
  return lang === 'hi' ? HI_PLAN_DICT : EN_PLAN_DICT;
}
