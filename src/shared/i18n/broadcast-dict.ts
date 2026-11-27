import type { AppTranslations, Language } from './types';

const BC_EN =
  '📢 *Clearbreath Neighborhood Air Advisory — {c}*\n\n⚠️ Current AQI: *{a} ({l})*\n☀️ Optimal Outdoor Hours: *{h}*\n\n*Top Community Actions Today:*\n1. 🚫 Prohibit open biomass or dry leaf burning in society grounds.\n2. 🚗 Opt for carpooling or Metro to eliminate 2.4 kg CO2e per trip.\n3. 🧹 Use wet-mopping rather than dry-sweeping in common corridors.\n\n_Powered by Clearbreath • CPCB & EPA Clean Air Models_';
const BC_HI =
  '📢 *क्लियरब्रेथ पड़ोस वायु परामर्श — {c}*\n\n⚠️ वर्तमान एक्यूआई: *{a} ({l})*\n☀️ बाहर जाने का उपयुक्त समय: *{h}*\n\n*आज के प्रमुख सामुदायिक उपाय:*\n1. 🚫 सोसायटी परिसर में सूखे पत्ते या कचरा जलाना बंद करें।\n2. 🚗 प्रति यात्रा 2.4 किग्रा CO2e बचाने के लिए कारपूलिंग या मेट्रो चुनें।\n3. 🧹 साझा गलियारों में सूखी झाड़ू के बजाय गीला पोछा लगाएं।\n\n_क्लियरब्रेथ द्वारा संचालित • सीपीसीबी और ईपीए स्वच्छ वायु मॉडल_';
const NW = {
  en: 'None today (stay indoors)',
  hi: 'आज कोई सुरक्षित समय नहीं (घर के अंदर रहें)',
};

type SeverityKey = keyof AppTranslations['severity'];
type SensitivityKey = 'low' | 'elevated' | 'high';

const HI_BAND: Readonly<Record<SeverityKey, string>> = {
  good: 'वायु गुणवत्ता अच्छी है; ताजी हवा के लिए वेंटिलेशन उपयुक्त है।',
  satisfactory: 'वायु गुणवत्ता संतोषजनक है; सामान्य बाहरी गतिविधि सुरक्षित है।',
  moderate: 'वायु गुणवत्ता मध्यम प्रदूषित है; दोपहर में वेंटिलेशन करें।',
  poor: 'वायु गुणवत्ता खराब है; सुबह और शाम के स्मॉग से बचें।',
  veryPoor: 'वायु गुणवत्ता बहुत खराब है; घर के अंदर एयर प्यूरीफायर चलाएं।',
  severe: 'वायु गुणवत्ता गंभीर है; खिड़कियां सील रखें और बाहर न निकलें।',
};

const HI_SENS: Readonly<Record<SensitivityKey, string>> = {
  low: 'अधिक प्रदूषण वाले समय पर निगरानी रखें।',
  elevated: 'लंबे समय तक बाहरी व्यायाम सीमित रखें।',
  high: 'संवेदनशील सदस्यों के लिए N95 मास्क व शुद्ध इनडोर हवा प्राथमिकता दें।',
};

/** Resolves localized particulate safety guidance for the active language. */
export function getLocalizedGuidance(
  lang: Language,
  cat: SeverityKey,
  sens: SensitivityKey,
  en: string
): string {
  return lang === 'en' ? en : `${HI_BAND[cat]} ${HI_SENS[sens]}`;
}

/** Formats the WhatsApp/RWA neighborhood broadcast message in EN or HI. */
export function formatCommunityBroadcast(opts: {
  readonly language: Language;
  readonly city: string;
  readonly aqiValue: number;
  readonly categoryLabel: string;
  readonly outdoorWindow?: {
    readonly startHour: number;
    readonly endHour: number;
  };
}): string {
  const w = opts.outdoorWindow;
  const fmt = (h: number) => `${String(h).padStart(2, '0')}:00`;
  const hrs = w ? `${fmt(w.startHour)} – ${fmt(w.endHour)}` : NW[opts.language];
  const tpl = opts.language === 'hi' ? BC_HI : BC_EN;
  return tpl
    .replace('{c}', opts.city)
    .replace('{a}', String(opts.aqiValue))
    .replace('{l}', opts.categoryLabel)
    .replace('{h}', hrs);
}
