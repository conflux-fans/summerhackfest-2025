import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Network, Search, Book } from 'lucide-react'

export default function BottomNav() {
  const { t } = useTranslation()
  
  const navItemClasses = ({ isActive }: { isActive: boolean }) => {
    const baseClasses = 'flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-all duration-200 relative group min-h-[64px]'
    return `${baseClasses} ${
      isActive
        ? 'text-blue-700 dark:text-blue-300'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
    }`
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-700/80 shadow-lg shadow-gray-500/5 dark:shadow-gray-900/20 z-[9999] transform-gpu" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex h-16 w-full px-2 gap-0 justify-between items-stretch">
        <NavLink to="/" className={navItemClasses} end>
          {({ isActive }) => (
            <>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/30 shadow-sm'
                  : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800/60 dark:hover:to-blue-900/30'
              }`}>
                <Home className="w-4 h-4" />
              </div>
              <span className="mt-1 text-[10px] leading-tight">{t('navigation.home')}</span>
            </>
          )}
        </NavLink>
        <NavLink to="/familyTree" className={navItemClasses}>
          {({ isActive }) => (
            <>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/30 shadow-sm'
                  : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800/60 dark:hover:to-blue-900/30'
              }`}>
                <Network className="w-4 h-4" />
              </div>
              <span className="mt-1 text-[10px] leading-tight">{t('navigation.familyTree')}</span>
            </>
          )}
        </NavLink>
        <NavLink to="/people" className={navItemClasses}>
          {({ isActive }) => (
            <>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/30 shadow-sm'
                  : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800/60 dark:hover:to-blue-900/30'
              }`}>
                <Book className="w-4 h-4" />
              </div>
              <span className="mt-1 text-[10px] leading-tight">{t('navigation.people')}</span>
            </>
          )}
        </NavLink>
        <NavLink to="/search" className={navItemClasses}>
          {({ isActive }) => (
            <>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/50 dark:to-cyan-900/30 shadow-sm'
                  : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800/60 dark:hover:to-blue-900/30'
              }`}>
                <Search className="w-4 h-4" />
              </div>
              <span className="mt-1 text-[10px] leading-tight">{t('navigation.search')}</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  )
}


