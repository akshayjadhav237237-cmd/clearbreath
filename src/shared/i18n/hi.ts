import type { AppTranslations } from './types';

/** Hindi translations dictionary for user interface copy. */
export const HI_TRANSLATIONS: AppTranslations = {
  appName: 'क्लियरब्रेथ',
  nav: {
    airNow: 'वर्तमान वायु',
    household: 'परिवार प्रोफाइल',
    plan: 'दैनिक योजना',
    actions: 'उपाय',
    compare: 'तुलना',
    assistant: 'एआई सलाहकार',
    community: 'समुदाय',
  },
  severity: {
    good: 'अच्छा',
    satisfactory: 'संतोषजनक',
    moderate: 'मध्यम',
    poor: 'खराब',
    veryPoor: 'बहुत खराब',
    severe: 'गंभीर',
  },
  common: {
    ugm3: 'माइक्रोग्राम/मी³',
    estimateNote:
      'निर्दिष्ट मान्यताओं के अंतर्गत मॉडल किया गया अनुमान; वास्तविक जोखिम वेंटिलेशन और उत्सर्जन स्रोतों के अनुसार बदल सकता है।',
    low: 'कम',
    medium: 'मध्यम',
    high: 'उच्च',
    confidencePrefix: 'विश्वसनीयता:',
    confidenceTiers: {
      low: 'कम अनुभवजन्य विश्वास',
      medium: 'मध्यम अनुभवजन्य विश्वास',
      high: 'उच्च वैज्ञानिक सहमति',
    },
    closeDialog: 'डायलाग बंद करें',
    dismissToast: 'सूचना बंद करें',
    errorTitle: 'कुछ गड़बड़ हो गई',
    errorDesc: 'यह दृश्य दिखाने में असमर्थ। कृपया पृष्ठ रीफ़्रेश करें।',
  },
  household: {
    title: 'परिवार एवं आवास विवरण',
    desc: 'अपने परिवार के सदस्यों, घर की सीलिंग और आवागमन के अनुसार सटीक वायु प्रदूषण परामर्श प्राप्त करें।',
    presetsTitle: 'त्वरित प्रोफाइल',
    delhiFamily: 'दिल्ली-एनसीआर परिवार (3 पीढ़ियां)',
    puneStudent: 'पुणे छात्र (एकल)',
    mumbaiSenior: 'मुंबई वरिष्ठ नागरिक दंपति',
    membersTitle: 'परिवार के सदस्य',
    homeTitle: 'घर का प्रकार एवं सीलिंग',
    budgetTitle: 'मासिक प्रदूषण नियंत्रण बजट (₹)',
  },
  airNow: {
    title: 'परिवेशी वायु गुणवत्ता सूचकांक',
    citySelect: 'शहर चुनें',
    pm25: 'पीएम 2.5 (सूक्ष्म कण)',
    pm10: 'पीएम 10 (श्वसनीय कण)',
    dominant: 'मुख्य प्रदूषक',
    liveBadge: 'लाइव डेटा',
    sampleBadge: 'सिम्युलेटेड डेटा',
  },
  plan: {
    title: '24-घंटे का वायु गुणवत्ता चक्र',
    outdoorWindow: 'बाहर जाने का उपयुक्त समय',
    purifierSchedule: 'एयर प्यूरीफायर चलाने का समय',
    ventilation: 'कमरों में ताजी हवा का समय',
    peakSmogWarning:
      'अत्यधिक स्मॉग का समय: खिड़कियां बंद रखें और प्यूरीफायर चलाएं।',
  },
  compare: {
    title: 'प्रदूषण रोकथाम प्रभाव तुलना',
    baseline: 'बिना किसी उपाय के (वर्तमान स्थिति)',
    mitigated: 'योजनाबद्ध उपायों के साथ',
  },
  assistant: {
    title: 'एआई वायु गुणवत्ता सहायक',
    disclaimer:
      'परामर्श सीपीसीबी एवं ईपीए मानकों पर आधारित है। शारीरिक लक्षणों के लिए चिकित्सक से परामर्श लें।',
    placeholder: 'वायु गुणवत्ता, फिल्टर या यात्रा सुरक्षा के बारे में पूछें...',
    send: 'पूछें',
    consentToggle: 'क्लाउड जेमिनी 3.8 फ्लैश सक्षम करें (केवल अनुमत फ़ील्ड)',
    modeLocal: 'स्थानीय टेम्पलेट इंजन',
    modeGemini: 'जेमिनी 3.8 फ्लैश (सत्यापित)',
  },
  community: {
    title: 'पड़ोस एवं आरडब्ल्यूए संदेश कार्ड',
    desc: 'अपने अपार्टमेंट व्हाट्सएप ग्रुप या आरडब्ल्यूए के साथ आज की वायु गुणवत्ता और उपयुक्त समय साझा करें।',
    copyBroadcast: 'संदेश कॉपी करें',
    copiedNotice: 'संदेश क्लिपबोर्ड में कॉपी हो गया!',
  },
} as const;
