import type { Language } from './types';

const HI_DESCRIPTIONS: Readonly<Record<string, string>> = {
  'act-indoor-seal-gaps':
    'बाहरी PM2.5 प्रवेश रोकने के लिए खिड़की और दरवाजों के किनारों पर हाई-डेंसिटी फोम या EPDM रबर स्ट्रिप लगाएं।',
  'act-indoor-box-fan':
    'उच्च-CADR एयर क्लीनर बनाने के लिए सामान्य बॉक्स फैन के इनटेक साइड पर 20-इंच MERV-13 फ़िल्टर टेप से लगाएं।',
  'act-indoor-close-windows-smog':
    'सुबह (06:00-10:00) और शाम (19:00-23:00) के तीव्र स्मॉग घंटों में बाहरी खिड़कियां और दरवाजे बंद रखें।',
  'act-indoor-wet-mopping':
    'जमी हुई बारीक धूल को दोबारा हवा में उड़ने से रोकने के लिए सूखी झाड़ू की बजाय गीले माइक्रोफाइबर पोंछे का उपयोग करें।',
  'act-indoor-kitchen-exhaust':
    'खाना पकाने, तलने या छौंक लगाते समय धुएं और अल्ट्राफाइन कणों को बाहर निकालने के लिए किचन एग्जॉस्ट चलाएं।',
  'act-indoor-no-incense-candles':
    'कार्बन कालिख और धुएं से बचने के लिए घर के अंदर अगरबत्ती, धूप और मोमबत्ती न जलाएं (मानता है कि पहले नियमित उपयोग हो रहा था)।',
  'act-mobility-metro-shift':
    'सड़क के सीधे धुएं और कार्बन उत्सर्जन को कम करने के लिए निजी वाहन के बजाय दिल्ली मेट्रो से यात्रा करें।',
  'act-mobility-electric-or-bus':
    'स्थानीय टेलपाइप उत्सर्जन कम करने के लिए दोपहिया वाहन के बजाय CNG/इलेक्ट्रिक बस या इलेक्ट्रिक दोपहिया अपनाएं।',
  'act-mobility-carpool':
    'प्रति यात्री सड़क उत्सर्जन और यातायात प्रदूषण को आधा करने के लिए सहकर्मियों या पड़ोसियों के साथ कारपूल करें।',
  'act-mobility-cycle-low-aqi':
    'कम प्रदूषण वाले दोपहर के समय में मुख्य सड़कों के बजाय कम ट्रैफ़िक वाले आवासीय मार्गों पर साइकिल चलाएं।',
  'act-mobility-avoid-rush-two-wheeler':
    'पीक ट्रैफ़िक धुएं के सीधे संपर्क से बचने के लिए सुबह दोपहिया यात्रा को न्यूनतम एक्यूआई समय तक टालें।',
  'act-mobility-walk-n95-window':
    'कणों के सीधे साँस में जाने से बचने के लिए केवल दोपहर के कम एक्यूआई समय में फिटेड N95 पहनकर पैदल चलें।',
  'act-outdoor-shift-exercise-hour':
    'तेज व्यायाम को सुबह के स्मॉग (06:00-08:00) के बजाय दोपहर (13:00-15:00) के कम प्रदूषण समय में करें।',
  'act-outdoor-wear-n95-transit':
    'बाहरी यात्रा और सड़क किनारे प्रतीक्षा के दौरान एयरटाइट सील वाला प्रमाणित NIOSH N95 मास्क पहनें।',
  'act-outdoor-wear-ffp2-mask':
    'बारीक हानिकारक कणों को छानने के लिए बाहरी गतिविधियों के दौरान EN 149 FFP2 मास्क पहनें।',
  'act-outdoor-avoid-exertion-aqi-300':
    '300 से अधिक (बहुत खराब / गंभीर) एक्यूआई पर फेफड़ों की सुरक्षा हेतु भारी बाहरी व्यायाम या दौड़ स्थगित करें।',
  'act-outdoor-stay-indoors-inversion':
    'शीतकालीन थर्मल इनवर्जन के दौरान सूर्यास्त से मध्य-सुबह तक बंद भवन के अंदर रहें।',
  'act-household-chulha-to-clean':
    'रसोई के भारी धुएं को समाप्त करने के लिए लकड़ी, गोबर या कोयला चूल्हे के स्थान पर एलपीजी या इंडक्शन अपनाएं।',
  'act-household-no-waste-burning':
    'सूखी पत्तियां, प्लास्टिक और कचरा खुले में न जलाएं; खाद या नगर निगम संग्रहण का उपयोग करें।',
  'act-household-range-hood-grease-filter':
    'खाना पकाने के तेल की धुंध और धुएं को फंसाने के लिए रसोई चिमनी में एल्यूमीनियम ग्रीस फ़िल्टर लगाएं।',
  'act-household-maintain-ventilation-filters':
    'सर्दियों के स्मॉग मौसम में हर दो सप्ताह में एसी प्री-फ़िल्टर और वेंटिलेशन स्क्रीन की सफाई करें।',
  'act-community-report-waste-burning':
    'कार्रवाई के लिए सीपीसीबी समीर ऐप पर खुले में कचरा जलाने की जियो-टैग की गई रिपोर्ट दर्ज करें।',
  'act-community-pool-hepa-common':
    'आरडब्ल्यूए के साथ मिलकर अपार्टमेंट के साझा लॉबी, अध्ययन कक्ष और क्लबहाउस में HEPA क्लीनर लगवाएं।',
  'act-community-wet-road-washing':
    'उड़ती हुई सड़क की धूल को दबाने के लिए कॉलोनी की सड़कों पर नियमित पानी के छिड़काव की व्यवस्था करें।',
  'act-community-anti-smog-mist-cannons':
    'निर्माण स्थलों के आसपास अनिवार्य वाटर मिस्ट कैनन और डस्ट-बैरियर जाली के लिए स्थानीय निकाय से मांग करें।',
};

/** Translates an action catalog description into Hindi when available. */
export function translateActionDescription(
  actionId: string,
  fallbackDesc: string,
  lang: Language
): string {
  if (lang !== 'hi') return fallbackDesc;
  return HI_DESCRIPTIONS[actionId] ?? fallbackDesc;
}

/** Translates heuristic daily plan advisory strings into Hindi when active. */
export function translatePlanAdvisory(summary: string, lang: Language): string {
  if (lang !== 'hi') return summary;
  if (summary.includes('Severe air quality (AQI > 400)')) {
    return 'दिन भर गंभीर वायु गुणवत्ता (एक्यूआई > 400)। खिड़कियां बंद रखकर घर के अंदर रहें और एयर प्यूरीफायर हाई मोड पर चलाएं।';
  }
  if (summary.includes('Outdoor air quality exceeds recommended limits')) {
    return 'उच्च संवेदनशील सदस्यों के लिए बाहरी वायु गुणवत्ता सीमा से अधिक है (एक्यूआई > 200)। घर के अंदर रहें और बाहरी जोखिम कम रखें।';
  }
  if (summary.includes('Elevated smog levels persist')) {
    return 'उच्च स्मॉग स्तर बना हुआ है। बाहरी व्यायाम से बचें और घर के अंदर की हवा साफ रखें।';
  }
  const outMatch = summary.match(
    /Optimal outdoor window is (\d+):00 to (\d+):00 \(average AQI (\d+)\)/
  );
  if (outMatch) {
    const ventMatch = summary.match(
      /Best natural ventilation window is (\d+):00 to (\d+):00/
    );
    const outPart = `बाहर जाने का उपयुक्त समय ${outMatch[1]}:00 से ${outMatch[2]}:00 (औसत एक्यूआई ${outMatch[3]}) है।`;
    const ventPart = ventMatch
      ? ` ताजी हवा के लिए उपयुक्त समय ${ventMatch[1]}:00 से ${ventMatch[2]}:00 है।`
      : ' दिन भर एक्यूआई 200 से ऊपर रहने के कारण खिड़कियां बंद रखें।';
    return `${outPart}${ventPart} नींद और पीक स्मॉग घंटों में एयर प्यूरीफायर हाई पर चलाएं।`;
  }
  return summary;
}
