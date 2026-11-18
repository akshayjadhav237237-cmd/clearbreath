import type { AqiCategory } from '../../domain/contracts';

/** Hindi AQI severity descriptors. */
export const HI_SEVERITY_SUMMARIES: Readonly<Record<AqiCategory, string>> = {
  good: 'वायु गुणवत्ता अच्छी है और स्वास्थ्य जोखिम नगण्य है।',
  satisfactory:
    'वायु गुणवत्ता संतोषजनक है, संवेदनशील व्यक्तियों को हल्की परेशानी हो सकती है।',
  moderate:
    'मध्यम वायु प्रदूषण; संवेदनशील लोगों को सांस लेने में कठिनाई हो सकती है।',
  poor: 'वायु गुणवत्ता खराब है। अधिक समय बाहर रहने से सांस की समस्या हो सकती है।',
  veryPoor:
    'वायु गुणवत्ता बहुत खराब है। बुजुर्गों और बच्चों को घर के अंदर रहना चाहिए।',
  severe:
    'गंभीर वायु आपातकाल। खिड़कियां बंद रखें और बाहरी गतिविधियों से पूरी तरह बचें।',
};

/** Hindi caution notes by sensitivity level. */
export const HI_CAUTION_NOTES: Readonly<Record<string, string>> = {
  high: 'उच्च जोखिम: बच्चों और बुजुर्गों को घर के भीतर रखें और एयर प्यूरीफायर चलाएं।',
  elevated:
    'मध्यम जोखिम: बाहरी व्यायाम से बचें और सुबह-शाम खिड़कियां बंद रखें।',
  low: 'सामान्य सलाह: शाम के समय खिड़कियां बंद रखें और एक्यूआई की निगरानी करें।',
};

/** Default fallback answers for generic queries in Hindi. */
export const HI_DEFAULT_ANSWERS = {
  general:
    'आपके घर के प्रोफाइल और एक्यूआई के आधार पर, एयर प्यूरीफायर और खिड़की सीलिंग को प्राथमिकता दें।',
  medicalDisclaimer:
    'सूचना: यह केवल पर्यावरणीय परामर्श है। सांस की गंभीर समस्या होने पर तुरंत चिकित्सक से परामर्श लें।',
  refusal:
    'मैं केवल वायु प्रदूषण से बचाव, घरेलू उपायों और यात्रा विकल्पों से संबंधित प्रश्नों का उत्तर दे सकता हूँ।',
} as const;
