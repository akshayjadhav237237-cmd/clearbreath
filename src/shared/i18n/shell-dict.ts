import type { Language } from './types';

const EN_SHELL = {
  subtitle: 'Winter Smog Assistant',
  aqiLabel: 'AQI',
  langAria: 'Language Selector',
  toDark: 'Switch to dark theme',
  toLight: 'Switch to light theme',
  navAria: 'Main Navigation',
  skipLink: 'Skip to main content',
  loading: 'Loading view...',
  footer:
    '© 2026 Clearbreath • CPCB NAQI & EPA Mass-Balance Air Quality Models',
  pm25Tip: 'CPCB NAQI 24h average breakpoint model',
  pm10Tip: 'Inhalable coarse particle concentration',
  dominantTip: 'Governs total AQI value via highest sub-index',
  pm25Label: 'PM2.5',
  pm10Label: 'PM10',
  attribution:
    'Air quality data powered by Open-Meteo.com under Creative Commons Attribution 4.0 International (CC BY 4.0)',
  factsBtn: 'Grounding Facts',
  factsTitle: 'Grounding Facts Sent to AI',
  apiKeyLabel: 'Gemini API Key:',
  apiKeyAria: 'Gemini API Key',
  apiKeyPlaceholder: 'Enter API key (in-memory only; not persisted)',
  welcome: 'Hello! I am Clearbreath, your winter smog assistant.',
  prompts: [
    'Can my child play outdoors at 4pm?',
    'How much will a DIY air cleaner reduce indoor PM2.5?',
    'What is the cleanest commute option during severe smog?',
  ],
  refusalText: 'Disallowed input or safety violation.',
  selectedCityFallback: 'Selected City',
  factSealGaps: 'Weatherstripping reduces infiltration by 20%',
  draftHeading: 'WhatsApp / RWA Broadcast Draft',
  clipboardError: 'Could not access clipboard.',
  resetToast:
    'Corrupted or incompatible stored data reset to default family profile.',
};

/** Bilingual dictionary contract for shell and core panels. */
export type ShellDict = typeof EN_SHELL;

const HI_SHELL: ShellDict = {
  subtitle: 'शीतकालीन स्मॉग सहायक',
  aqiLabel: 'एक्यूआई',
  langAria: 'भाषा चुनें',
  toDark: 'डार्क थीम पर स्विच करें',
  toLight: 'लाइट थीम पर स्विच करें',
  navAria: 'मुख्य नेविगेशन',
  skipLink: 'मुख्य सामग्री पर जाएं',
  loading: 'दृश्य लोड हो रहा है...',
  footer:
    '© 2026 क्लियरब्रेथ • सीपीसीबी NAQI और ईपीए मास-बैलेंस वायु गुणवत्ता मॉडल',
  pm25Tip: 'सीपीसीबी NAQI 24-घंटे औसत ब्रेकपॉइंट मॉडल',
  pm10Tip: 'श्वसनीय मोटे कणों की सांद्रता',
  dominantTip: 'उच्चतम उप-सूचकांक के माध्यम से कुल एक्यूआई निर्धारित करता है',
  pm25Label: 'पीएम 2.5',
  pm10Label: 'पीएम 10',
  attribution:
    'ओपन-मेटियो (Open-Meteo.com) द्वारा CC BY 4.0 के तहत प्रदत्त वायु डेटा',
  factsBtn: 'आधारभूत तथ्य',
  factsTitle: 'एआई को भेजे गए आधारभूत तथ्य',
  apiKeyLabel: 'जेमिनी API कुंजी:',
  apiKeyAria: 'जेमिनी API कुंजी',
  apiKeyPlaceholder: 'API कुंजी दर्ज करें (केवल मेमोरी में; सहेजी नहीं जाती)',
  welcome: 'नमस्ते! मैं क्लियरब्रेथ हूँ, आपका शीतकालीन स्मॉग सहायक।',
  prompts: [
    'क्या मेरा बच्चा शाम 4 बजे बाहर खेल सकता है?',
    'DIY एयर क्लीनर घर के अंदर पीएम 2.5 को कितना कम करेगा?',
    'गंभीर स्मॉग में यात्रा का सबसे स्वच्छ विकल्प क्या है?',
  ],
  refusalText: 'अमान्य इनपुट या सुरक्षा नीति उल्लंघन।',
  selectedCityFallback: 'चयनित शहर',
  factSealGaps: 'वेदरस्ट्रिपिंग से बाहरी धूल का प्रवेश 20% कम होता है',
  draftHeading: 'व्हाट्सएप / आरडब्ल्यूए प्रसारण मसौदा',
  clipboardError: 'क्लिपबोर्ड तक पहुंच नहीं हो सकी।',
  resetToast:
    'क्षतिग्रस्त या असंगत सहेजा गया डेटा डिफ़ॉल्ट परिवार प्रोफ़ाइल पर रीसेट कर दिया गया।',
};

const ERR_HEAD: Readonly<Record<Language, Readonly<Record<string, string>>>> = {
  en: {
    'No Gemini API key configured.': 'No Gemini API key configured',
    'Invalid API key.': 'Invalid Gemini API key',
    'Gemini rate limit exceeded.': 'Cloud rate limit exceeded',
    'Request timed out.': 'AI request timed out',
    'Network failure.': 'Network failure',
  },
  hi: {
    'No Gemini API key configured.': 'जेमिनी API कुंजी दर्ज नहीं है',
    'Invalid API key.': 'अमान्य जेमिनी API कुंजी',
    'Gemini rate limit exceeded.': 'क्लाउड सीमा समाप्त',
    'Request timed out.': 'एआई अनुरोध समय समाप्त',
    'Network failure.': 'नेटवर्क विफलता',
  },
};
const UNAVAIL = {
  en: 'AI model unavailable, local guidance shown.',
  hi: 'एआई मॉडल उपलब्ध नहीं है, स्थानीय परामर्श दिखाया गया है।',
};
const CLOUD_HEAD = { en: 'Cloud AI unavailable', hi: 'क्लाउड एआई अनुपलब्ध है' };
const TAIL = {
  en: 'local guidance shown.',
  hi: 'स्थानीय परामर्श दिखाया गया है।',
};

export {
  formatCommunityBroadcast,
  getLocalizedGuidance,
} from './broadcast-dict';

/** Returns bilingual shell dictionary entries for the active language. */
export function getShellDict(language: Language): ShellDict {
  return language === 'hi' ? HI_SHELL : EN_SHELL;
}

/** Formats the assistant response engine provenance badge in EN or HI. */
export function formatAssistantSource(
  lang: Language,
  src: 'local' | 'gemini'
): string {
  const isGem = src === 'gemini';
  if (lang === 'hi') return `स्रोत: ${isGem ? 'जेमिनी इंजन' : 'स्थानीय इंजन'}`;
  return `Source: ${isGem ? 'gemini engine' : 'local engine'}`;
}

/** Resolves localized fallback error notice when cloud AI fails. */
export function formatFallbackNotice(
  lang: Language,
  reason?: string,
  refusal?: boolean
): string | null {
  if (!reason || refusal || reason.startsWith('AI cloud features')) return null;
  if (reason === 'modelUnavailable') return UNAVAIL[lang];
  const head = ERR_HEAD[lang][reason] ?? CLOUD_HEAD[lang];
  return `${head}; ${TAIL[lang]}`;
}

/** Formats the current-AQI grounding fact description in EN or HI. */
export function formatAqiFactText(
  lang: Language,
  city: string,
  aqi: number,
  lbl: string
): string {
  return lang === 'hi'
    ? `${city} में वर्तमान एक्यूआई ${aqi} (${lbl}) है`
    : `Current AQI in ${city} is ${aqi} (${lbl})`;
}
