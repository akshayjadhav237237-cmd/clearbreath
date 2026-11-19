import { EN_TRANSLATIONS } from './en';
import { HI_TRANSLATIONS } from './hi';
import type { AppTranslations, Language } from './types';

export type { AppTranslations, Language };

/** Returns localized string dictionary matching specified language code. */
export function getTranslations(lang: Language): AppTranslations {
  return lang === 'hi' ? HI_TRANSLATIONS : EN_TRANSLATIONS;
}
