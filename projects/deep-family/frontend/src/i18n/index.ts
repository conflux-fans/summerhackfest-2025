import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import language resources
import zhCN from '../locales/zh-CN/index.json'
import zhTW from '../locales/zh-TW/index.json'
import en from '../locales/en/index.json'

const resources = {
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
  'zh': { translation: zhCN }, // alias maps to Simplified Chinese
  'en': { translation: en }
}

const SUPPORTED = ['zh-CN', 'zh-TW', 'en', 'zh']

// Ensure default language setting
const getInitialLanguage = () => {
  const stored = localStorage.getItem('i18nextLng')
  if (stored && SUPPORTED.includes(stored)) return stored === 'zh' ? 'zh-CN' : stored
  // Try navigator languages
  const nav = (navigator.languages || [navigator.language]).find(l => !!l)
  if (nav) {
    if (nav === 'zh') return 'zh-CN'
    if (SUPPORTED.includes(nav)) return nav
    // collapse generic zh-* to zh-CN
    if (/^zh/i.test(nav)) return 'zh-CN'
  }
  return 'en' // Default to English
}

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Initialize react-i18next
  .init({
    resources,
    lng: getInitialLanguage(), // Use function to get initial language
    fallbackLng: {
      'zh': ['zh-CN'],
      'zh-TW': ['zh-CN'],
      'default': ['en']
    },
    supportedLngs: SUPPORTED,
    nonExplicitSupportedLngs: true,
    ns: ['translation'],
    defaultNS: 'translation',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false }, // React already protects against XSS
    debug: process.env.NODE_ENV === 'development',
    load: 'all',
    cleanCode: true,
  })

// Listen for language changes, ensure localStorage is always in sync
i18n.on('languageChanged', (lng) => {
  const normalized = lng === 'zh' ? 'zh-CN' : lng
  localStorage.setItem('i18nextLng', normalized)
})

// Ensure initial language setting is correct
const currentLang = i18n.language === 'zh' ? 'zh-CN' : i18n.language
if (currentLang && SUPPORTED.includes(currentLang)) {
  localStorage.setItem('i18nextLng', currentLang)
}

export default i18n