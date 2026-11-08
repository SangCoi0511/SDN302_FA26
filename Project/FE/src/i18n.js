/**
 * i18n Configuration
 * Internationalization setup using react-i18next
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import vi from './locales/vi.json';
import en from './locales/en.json';

// Language resources
const resources = {
  vi: { translation: vi },
  en: { translation: en },
};

i18n
  // Detect user language from browser/localStorage
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'vi', // Default language
    debug: false, // Set to true for development debugging

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      // Cache user language in localStorage
      caches: ['localStorage'],
      // localStorage key name
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
