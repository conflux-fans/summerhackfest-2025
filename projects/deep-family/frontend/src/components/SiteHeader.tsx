import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Search, Network, Book } from 'lucide-react'
import HeaderControls from './HeaderControls'
import Logo from './Logo'
import PageContainer from './PageContainer'

/**
 * SiteHeader: Unified top navigation/header bar used across all pages.
 * - On home page (path === '/') shows gradient decorative style
 * - On all other pages shows solid surface style
 */
export default function SiteHeader() {
  const { t } = useTranslation()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const navClasses = ({ isActive }: { isActive: boolean }) => {
    const baseClasses = 'inline-flex items-center gap-2 px-2 py-2 lg:px-4 lg:py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative group whitespace-nowrap'
    if (isHomePage) {
      return `${baseClasses} ${
        isActive
          ? 'text-white bg-white/25 shadow-lg dark:bg-white/15 backdrop-blur-sm border border-white/20 dark:border-white/10'
          : 'text-white/85 hover:text-white hover:bg-white/15 hover:shadow-md dark:text-gray-100/85 dark:hover:bg-white/10 hover:scale-105 backdrop-blur-sm'
      }`
    }
    return `${baseClasses} ${
      isActive
        ? 'text-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:text-blue-300 dark:from-blue-900/50 dark:to-cyan-900/30 shadow-sm border border-blue-200/50 dark:border-blue-700/30'
        : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:from-gray-800/60 dark:hover:to-blue-900/30 hover:scale-105 hover:shadow-sm'
    }`
  }

  return (
    <header className={`sticky top-0 z-[100] relative ${isHomePage ? 'bg-gradient-to-br from-blue-400/35 via-indigo-500/40 via-purple-500/35 to-violet-600/30 dark:from-blue-500/70 dark:via-indigo-600/75 dark:via-purple-600/70 dark:to-violet-700/65 backdrop-blur-3xl border-b border-white/20 dark:border-white/10 shadow-2xl shadow-blue-500/20 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.9)]' : 'bg-white/85 dark:bg-gray-950/95 backdrop-blur-2xl border-b border-gray-200/70 dark:border-gray-800/80 shadow-lg shadow-gray-500/5 dark:shadow-gray-900/20'}`}>
      {/* Decorative background elements for home page */}
      {isHomePage && (
        <>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-3 left-1/4 w-20 h-20 bg-gradient-to-br from-blue-400/25 via-cyan-400/20 to-teal-400/15 dark:from-blue-400/40 dark:via-cyan-400/35 dark:to-teal-400/30 rounded-full blur-xl animate-pulse-soft"></div>
            <div className="absolute -top-6 right-1/3 w-24 h-24 bg-gradient-to-br from-purple-400/20 via-violet-400/15 to-pink-400/12 dark:from-purple-400/35 dark:via-violet-400/30 dark:to-pink-400/25 rounded-full blur-2xl animate-float"></div>
            <div className="absolute -bottom-3 left-2/3 w-16 h-16 bg-gradient-to-br from-indigo-400/30 via-blue-400/25 to-cyan-400/20 dark:from-indigo-400/45 dark:via-blue-400/40 dark:to-cyan-400/35 rounded-full blur-lg animate-bounce-gentle"></div>
            <div className="absolute top-0 left-1/6 w-8 h-8 bg-gradient-to-br from-emerald-400/20 to-green-400/15 dark:from-emerald-400/30 dark:to-green-400/25 rounded-full blur-md animate-float delay-1000"></div>
            <div className="absolute -bottom-1 right-1/4 w-10 h-10 bg-gradient-to-br from-rose-400/15 to-orange-400/12 dark:from-rose-400/25 dark:to-orange-400/20 rounded-full blur-lg animate-pulse-soft delay-1000"></div>
            <div className="absolute top-2 right-1/6 w-6 h-6 bg-gradient-to-br from-yellow-400/25 to-amber-400/20 dark:from-yellow-400/35 dark:to-amber-400/30 rounded-full blur-sm animate-bounce-gentle delay-1000"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/3 to-white/8 dark:via-black/5 dark:to-black/15 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-indigo-500/5 via-purple-500/8 to-violet-500/6 dark:from-blue-500/15 dark:via-indigo-500/12 dark:via-purple-500/15 dark:to-violet-500/12 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/3 via-transparent via-transparent to-pink-400/3 dark:from-cyan-400/8 dark:to-pink-400/8 pointer-events-none"></div>
          <div className="absolute inset-0 bg-mesh-pattern dark:bg-mesh-pattern-dark opacity-10 dark:opacity-20 pointer-events-none"></div>
        </>
      )}
      <PageContainer className="relative h-16 flex items-center justify-between">
        <NavLink to="/" className={`flex items-center gap-3 font-bold transition-colors ${isHomePage ? 'text-white hover:text-blue-100 dark:text-gray-100' : 'text-gray-800 dark:text-gray-100'}`}>
          <Logo className={`w-8 h-8 ${isHomePage ? 'text-white dark:text-gray-100' : 'text-blue-500 dark:text-indigo-400'} hover:-rotate-90 transition-transform duration-300`} />
          <span className={`hidden sm:inline text-xl font-light tracking-widest uppercase ${isHomePage ? 'text-white dark:text-gray-100' : 'text-gray-900 dark:text-gray-100'}`} style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif', letterSpacing: '0.2em' }}>DeepFamily</span>
        </NavLink>
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 flex-shrink-0 min-w-0">
          <NavLink to="/" className={navClasses} end>
            <Home className="w-4 h-4" /> 
            <span className="hidden lg:inline">{t('navigation.home')}</span>
          </NavLink>
          <NavLink to="/familyTree" className={navClasses}>
            <Network className="w-4 h-4" /> 
            <span className="hidden lg:inline">{t('navigation.familyTree')}</span>
          </NavLink>
          <NavLink to="/people" className={navClasses}>
            <Book className="w-4 h-4" /> 
            <span className="hidden lg:inline">{t('navigation.people')}</span>
          </NavLink>
          <NavLink to="/search" className={navClasses}>
            <Search className="w-4 h-4" /> 
            <span className="hidden lg:inline">{t('navigation.search')}</span>
          </NavLink>
        </nav>
        <HeaderControls variant={isHomePage ? 'home' : 'normal'} />
      </PageContainer>
    </header>
  )
}
