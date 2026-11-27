import type { Language } from './types';

const HI_ASSUMPTIONS: Readonly<Record<string, string>> = {
  'Standard diurnal exposure pattern with average indoor occupancy':
    'औसत इनडोर उपस्थिति के साथ मानक दैनिक जोखिम पैटर्न',
  'Indoor infiltration based on building envelope sealing class':
    'घर की सीलिंग श्रेणी के आधार पर बाहरी धूल का आंतरिक प्रवेश',
  'Commute exposure calculated for round-trip travel':
    'दैनिक आने-जाने की दोनों तरफ की यात्रा के लिए जोखिम गणना',
  'Dose reductions aggregated across all living household members':
    'घर के सभी सदस्यों की सांस खुराक में कुल कमी का योग',
  'Multiple eligible indoor and exposure effects are combined multiplicatively.':
    'एक से अधिक पात्र आंतरिक और बाहरी उपायों के प्रभावों को गुणात्मक रूप से जोड़ा गया है।',
  'Assumes regular prior indoor incense or candle combustion; steady-state ambient mass balance includes no indoor emission term.':
    'यह मानता है कि पहले घर के अंदर नियमित रूप से अगरबत्ती या मोमबत्ती जलाई जाती थी; स्थिर-अवस्था मॉडल में अलग आंतरिक उत्सर्जन पद नहीं है।',
  'Purifier status: No active purifier':
    'प्यूरीफायर स्थिति: कोई सक्रिय प्यूरीफायर नहीं',
};

const HI_SEALING: Readonly<Record<string, string>> = {
  leaky: 'कम सील',
  average: 'औसत सील',
  tight: 'मजबूत सील',
};

const HI_ACTION_TITLES: Readonly<Record<string, string>> = {
  'act-indoor-seal-gaps': 'खिड़की और दरवाजों की दरारें फोम स्ट्रिप से सील करें',
  'act-indoor-box-fan': 'MERV-13 फ़िल्टर के साथ DIY बॉक्स-फैन एयर क्लीनर',
  'act-indoor-close-windows-smog':
    'सुबह और शाम के उच्च स्मॉग समय में खिड़कियां बंद रखें',
  'act-indoor-wet-mopping': 'सूखी झाड़ू के बजाय गीला पोंछा लगाएं',
  'act-indoor-kitchen-exhaust': 'खाना बनाते समय रसोई एग्जॉस्ट फैन चलाएं',
  'act-indoor-no-incense-candles':
    'घर के अंदर अगरबत्ती, धूप और मोमबत्ती बंद करें',
  'act-mobility-metro-shift':
    'कार या दोपहिया वाहन के बजाय दिल्ली मेट्रो से यात्रा करें',
  'act-mobility-electric-or-bus':
    'दोपहिया यात्रा को इलेक्ट्रिक वाहन या बस में बदलें',
  'act-mobility-carpool': 'सहकर्मियों या पड़ोसियों के साथ कारपूल करें',
  'act-mobility-cycle-low-aqi':
    'कम एक्यूआई समय में कम ट्रैफ़िक मार्ग पर साइकिल चलाएं',
  'act-mobility-avoid-rush-two-wheeler':
    'सुबह के व्यस्त समय में दोपहिया यात्रा से बचें',
  'act-mobility-walk-n95-window':
    'कम एक्यूआई समय में N95 मास्क पहनकर पैदल चलें',
  'act-outdoor-shift-exercise-hour':
    'बाहरी व्यायाम को न्यूनतम एक्यूआई समय में बदलें',
  'act-outdoor-wear-n95-transit': 'बाहरी यात्रा के दौरान फिटेड N95 मास्क पहनें',
  'act-outdoor-wear-ffp2-mask': 'बाहरी गतिविधियों में FFP2 मास्क पहनें',
  'act-outdoor-avoid-exertion-aqi-300':
    '300 से अधिक एक्यूआई पर बाहरी श्रम से बचें',
  'act-outdoor-stay-indoors-inversion':
    'शीतकालीन स्मॉग के चरम घंटों में घर के अंदर रहें',
  'act-household-chulha-to-clean':
    'बायोमास चूल्हे के बजाय एलपीजी या इंडक्शन अपनाएं',
  'act-household-no-waste-burning': 'कचरा या सूखी पत्तियां जलाने से बचें',
  'act-household-range-hood-grease-filter':
    'रसोई चिमनी में ग्रीस फ़िल्टर लगाएं',
  'act-household-maintain-ventilation-filters':
    'वेंटिलेशन और एसी फ़िल्टर नियमित साफ रखें',
  'act-community-report-waste-burning':
    'समीर ऐप पर खुले में कचरा जलाने की रिपोर्ट करें',
  'act-community-pool-hepa-common':
    'अपार्टमेंट के साझा क्षेत्रों के लिए HEPA प्यूरीफायर लें',
  'act-community-wet-road-washing':
    'कॉलोनी की सड़कों पर नियमित पानी का छिड़काव कराएं',
  'act-community-anti-smog-mist-cannons':
    'निर्माण स्थलों पर एंटी-स्मॉग मिस्ट कैनन की मांग करें',
};

/** Translates a model assumption line into the active language. */
export function translateCompareAssumption(
  assumption: string,
  lang: Language
): string {
  if (lang !== 'hi') return assumption;
  const activePrefix = 'Purifier status: Active CADR ';
  if (assumption.startsWith(activePrefix)) {
    const cadr = assumption.slice(activePrefix.length).replace(' m³/h', '');
    return `प्यूरीफायर स्थिति: सक्रिय CADR ${cadr} मी³/घंटा`;
  }
  return HI_ASSUMPTIONS[assumption] ?? assumption;
}

/** Translates an action catalog title into Hindi when available. */
export function translateActionTitle(
  actionId: string,
  fallbackTitle: string,
  lang: Language
): string {
  if (lang !== 'hi') return fallbackTitle;
  return HI_ACTION_TITLES[actionId] ?? fallbackTitle;
}

/** Translates home envelope sealing class label for display. */
export function translateSealingClass(sealing: string, lang: Language): string {
  if (lang !== 'hi') return sealing;
  return HI_SEALING[sealing] ?? sealing;
}
