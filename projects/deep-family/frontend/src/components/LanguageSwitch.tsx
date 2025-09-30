import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { languages, getLanguageByCode } from '../config/languages'

interface LanguageSwitchProps {
  variant?: 'home' | 'normal'
}

export default function LanguageSwitch({ variant = 'home' }: LanguageSwitchProps) {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isHomePage = variant === 'home'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageChange = (langCode: string) => {
    setIsOpen(false)
    i18n.changeLanguage(langCode).then(() => {
      console.log('Language changed successfully to:', i18n.language)
    }).catch((error) => {
      console.error('Error changing language:', error)
    })
  }

  const currentLanguage = getLanguageByCode(i18n.language)

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 lg:gap-2 px-2 py-2 lg:px-3 text-sm font-medium rounded-xl focus:outline-none transition-all duration-200 hover:scale-105 shadow-sm backdrop-blur-sm min-w-0 whitespace-nowrap ${
          isHomePage 
            ? 'border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/10 text-white dark:text-gray-200 hover:bg-white/30 dark:hover:bg-white/15 border' 
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/90 hover:border-gray-300 dark:hover:border-gray-600 border'
        } focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent`}
      >
        <Globe className={`w-4 h-4 flex-shrink-0 ${
          isHomePage ? 'text-white/80 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'
        }`} />
        {/* Hide text on small screens, only show icon */}
        <span className="text-sm font-medium hidden lg:inline truncate max-w-16 lg:max-w-20">
          {currentLanguage.nativeName}
        </span>
        <svg 
          className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 hidden lg:inline ${isOpen ? 'rotate-180' : ''} ${
            isHomePage ? 'text-white/70 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`absolute right-0 z-[9999] mt-2 w-40 sm:w-48 origin-top-right rounded-2xl shadow-xl backdrop-blur-xl transition-all duration-200 ${
        isOpen 
          ? 'opacity-100 visible transform translate-y-0 scale-100' 
          : 'opacity-0 invisible transform -translate-y-2 scale-95'
      } ${
        isHomePage 
          ? 'bg-white/95 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/50' 
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600'
      }`}>
        <div className="py-1">
          {languages.map((language, index) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`flex items-center justify-between w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-left transition-all duration-200 hover:scale-[1.02] ${
                index === 0 ? 'rounded-t-2xl mt-1' : index === languages.length - 1 ? 'rounded-b-2xl mb-1' : ''
              } ${
                i18n.language === language.code
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 font-semibold shadow-sm border-l-4 border-blue-500 dark:border-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 border-l-4 border-transparent'
              }`}
            >
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-sm truncate">{language.nativeName}</span>
                <span className="text-xs truncate opacity-75 hidden sm:block">{language.name}</span>
              </div>
              {i18n.language === language.code && (
                <div className="flex-shrink-0 ml-2 sm:ml-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}