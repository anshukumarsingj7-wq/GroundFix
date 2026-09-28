import en from './en';
import hi from './hi';
import kn from './kn';

export const translations = {
  en,
  hi,
  kn
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🌐' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' }
];

/**
 * Safe translation key resolver with automatic English fallback
 * Prevents undefined keys from ever showing to users
 * @param {string} path - Dot notation key path (e.g. 'nav.report' or 'report.title')
 * @param {string} lang - Selected language code ('en', 'hi', 'kn')
 * @returns {string} Translated string or English fallback
 */
export function getTranslation(path, lang = 'en') {
  if (!path) return '';

  const keys = path.split('.');
  const activeDict = translations[lang] || translations.en;
  const fallbackDict = translations.en;

  let value = activeDict;
  for (const key of keys) {
    if (value && value[key] !== undefined) {
      value = value[key];
    } else {
      value = undefined;
      break;
    }
  }

  if (value !== undefined) return value;

  // Fallback to English
  let fallbackValue = fallbackDict;
  for (const key of keys) {
    if (fallbackValue && fallbackValue[key] !== undefined) {
      fallbackValue = fallbackValue[key];
    } else {
      fallbackValue = undefined;
      break;
    }
  }

  return fallbackValue !== undefined ? fallbackValue : path;
}
