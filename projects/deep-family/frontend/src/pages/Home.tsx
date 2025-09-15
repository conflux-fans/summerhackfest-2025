import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Shield, 
  Coins, 
  Network, 
  TrendingUp, 
  Users, 
  Globe, 
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  Award,
  Book,
  Search,
  Code,
  PenTool
} from 'lucide-react'
import PageContainer from '../components/PageContainer'

export default function Home() {
  const { t } = useTranslation()
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50/50 via-blue-50/50 to-indigo-100/50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-800 flex items-center bg-mesh-pattern dark:bg-mesh-pattern-dark" style={{width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginTop: 'calc(-2rem - 56px)', paddingTop: 'calc(2rem + 56px)'}}>
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/8 to-indigo-600/5 dark:from-blue-600/15 dark:via-purple-700/20 dark:to-indigo-700/15"></div>
        
        {/* Floating background shapes with animations */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/25 to-cyan-500/15 dark:from-blue-500/35 dark:to-cyan-500/25 rounded-full blur-2xl animate-float"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/15 dark:from-purple-600/30 dark:to-pink-600/25 rounded-full blur-2xl animate-pulse-soft"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-br from-indigo-500/25 to-blue-500/15 dark:from-indigo-600/35 dark:to-blue-600/25 rounded-full blur-2xl animate-bounce-gentle"></div>
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/15 dark:from-emerald-600/30 dark:to-teal-600/25 rounded-full blur-xl animate-float delay-1000"></div>
        </div>
        
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/5 dark:to-slate-900/10"></div>
        
        <PageContainer className="relative text-center">
          {/* Enhanced Main Title with animations */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-600/30 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Decentralized Family Tree</span>
            </div>
            
            <h1 className="text-3xl sm:text-2xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight tracking-tight px-4 break-words hyphens-auto">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {t('home.title')}
              </span>
            </h1>
          </div>
          
          {/* Enhanced Subtitle */}
          <div className="animate-fade-in-up animation-delay-200">
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-2xl text-gray-600 dark:text-gray-400 max-w-5xl mx-auto mb-12 leading-relaxed font-light px-4 break-words hyphens-auto">
              {t('home.subtitle')}
            </p>
          </div>
          
          {/* Enhanced CTA Buttons */}
          <div className="animate-fade-in-up animation-delay-400 flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-6 mb-16 px-2 sm:px-4 max-w-6xl mx-auto">
            <NavLink 
              to="/actions" 
              className="group relative inline-flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-xs sm:text-sm md:text-base lg:text-lg hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-600 dark:hover:from-blue-400 dark:hover:to-purple-500 transform hover:scale-105 transition-all duration-300 shadow-xl sm:shadow-2xl hover:shadow-blue-500/25 dark:shadow-blue-500/10 dark:hover:shadow-blue-400/20 overflow-hidden whitespace-nowrap flex-shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-1.5 sm:gap-2 lg:gap-3 justify-center">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                <span className="text-xs sm:text-sm md:text-base lg:text-lg">{t('home.blockchainActions', 'Blockchain Actions')}</span>
              </div>
            </NavLink>
            
            <NavLink 
              to="/familyTree" 
              className="group inline-flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm md:text-base lg:text-lg border-2 border-blue-200/80 dark:border-purple-400/60 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400/80 dark:hover:border-purple-400/80 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-purple-500/20 transition-all duration-300 backdrop-blur-sm whitespace-nowrap flex-shrink-0"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 justify-center">
                <Network className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                <span className="text-xs sm:text-sm md:text-base lg:text-lg">{t('home.exploreFamilyTree')}</span>
              </div>
            </NavLink>

            <NavLink 
              to="/search" 
              className="group inline-flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm md:text-base lg:text-lg border-2 border-green-200/80 dark:border-green-400/60 hover:bg-white dark:hover:bg-slate-800 hover:border-green-400/80 dark:hover:border-green-400/80 hover:shadow-xl hover:shadow-green-500/10 dark:hover:shadow-green-500/20 transition-all duration-300 backdrop-blur-sm whitespace-nowrap flex-shrink-0"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 justify-center">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                <span className="text-xs sm:text-sm md:text-base lg:text-lg">{t('home.participate')}</span>
              </div>
            </NavLink>
          </div>
          
          {/* Tag Strip */}
          <div className="animate-fade-in-up animation-delay-500 mb-16">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 max-w-6xl mx-auto px-2 sm:px-4">
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full bg-white/60 dark:bg-slate-800/60 border border-blue-200/50 dark:border-blue-600/30 backdrop-blur-sm flex-shrink-0 min-w-0">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('home.tagStrip.protocol')}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full bg-white/60 dark:bg-slate-800/60 border border-purple-200/50 dark:border-purple-600/30 backdrop-blur-sm flex-shrink-0 min-w-0">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-pulse animation-delay-200 flex-shrink-0"></div>
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('home.tagStrip.incentive')}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full bg-white/60 dark:bg-slate-800/60 border border-indigo-200/50 dark:border-indigo-600/30 backdrop-blur-sm flex-shrink-0 min-w-0">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full animate-pulse animation-delay-400 flex-shrink-0"></div>
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('home.tagStrip.nft')}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full bg-white/60 dark:bg-slate-800/60 border border-emerald-200/50 dark:border-emerald-600/30 backdrop-blur-sm flex-shrink-0 min-w-0">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse animation-delay-600 flex-shrink-0"></div>
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{t('home.tagStrip.zk')}</span>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Value Propositions */}
      <section className="py-28 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-850/50 dark:to-slate-900">
        <PageContainer>
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-purple-100 dark:from-slate-800 dark:to-purple-900/30 border border-slate-200 dark:border-slate-700 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Value Props</span>
            </div>
            
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-purple-700 to-indigo-700 dark:from-slate-100 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent">
                {t('home.valueProps.title')}
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              {t('home.valueProps.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up animation-delay-300">
            {/* Trusted Genealogy */}
            <div className="group relative animate-scale-in h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-blue-100/50 dark:border-blue-400/20 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[320px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 dark:from-blue-400 dark:via-blue-500 dark:to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Network className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.valueProps.trustedGenealogy.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.valueProps.trustedGenealogy.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Consensus Focus */}
            <div className="group relative animate-scale-in animation-delay-100 h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-purple-100/50 dark:border-purple-400/20 hover:shadow-purple-500/10 dark:hover:shadow-purple-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[320px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 dark:from-purple-400 dark:via-purple-500 dark:to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.valueProps.consensusFocus.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.valueProps.consensusFocus.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Value Precipitation */}
            <div className="group relative animate-scale-in animation-delay-200 h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-emerald-100/50 dark:border-emerald-400/20 hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[320px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.valueProps.valuePrecipitation.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.valueProps.valuePrecipitation.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Narrative Extension */}
            <div className="group relative animate-scale-in animation-delay-300 h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-indigo-100/50 dark:border-indigo-400/20 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[320px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 dark:from-indigo-400 dark:via-indigo-500 dark:to-violet-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Book className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.valueProps.narrativeExtension.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.valueProps.narrativeExtension.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Guardian */}
            <div className="group relative animate-scale-in animation-delay-400 h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-orange-100/50 dark:border-orange-400/20 hover:shadow-orange-500/10 dark:hover:shadow-orange-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[320px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 dark:from-orange-400 dark:via-orange-500 dark:to-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.valueProps.privacyGuardian.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.valueProps.privacyGuardian.description')}
                  </p>
                </div>
              </div>
            </div>

            {/* Open Composition */}
            <div className="group relative animate-scale-in animation-delay-500 h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-red-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-rose-100/50 dark:border-rose-400/20 hover:shadow-rose-500/10 dark:hover:shadow-rose-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[320px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-rose-500 via-rose-600 to-red-600 dark:from-rose-400 dark:via-rose-500 dark:to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.valueProps.openComposition.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.valueProps.openComposition.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Dual Layer Architecture */}
      <section className="relative overflow-hidden py-24 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-800">
        {/* Enhanced decorative background layers */}
        <div className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(59,130,246,0.12),transparent_70%)] dark:bg-[radial-gradient(circle_at_25%_30%,rgba(59,130,246,0.20),transparent_75%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_65%,rgba(139,92,246,0.10),transparent_65%)] dark:bg-[radial-gradient(circle_at_75%_65%,rgba(139,92,246,0.18),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(99,102,241,0.08),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_100%,rgba(99,102,241,0.15),transparent_65%)]" />
        </div>
        
        {/* Enhanced grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(71,85,105,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(71,85,105,0.3)_1px,transparent_1px)] bg-[size:100px_100px] opacity-30" />
        
        <PageContainer className="relative">
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-blue-900/30 border border-slate-200 dark:border-slate-700 mb-6 backdrop-blur-sm">
              <Network className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">System Architecture</span>
            </div>
            
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                {t('home.architecture.title')}
              </span>
            </h2>
            
            <p className="text-lg sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed break-words hyphens-auto px-2 sm:px-4">
              {t('home.architecture.subtitle')}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 mb-24 animate-fade-in-up animation-delay-300 lg:items-stretch">
            {/* Layer 1: Privacy Protection */}
            <div className="group relative animate-slide-in-right h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/90 rounded-3xl p-4 sm:p-6 lg:p-12 shadow-2xl border border-blue-100/50 dark:border-blue-400/10 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[580px]">
                <div className="flex items-start mb-6 sm:mb-8">
                  <div className="relative mr-4 sm:mr-6 flex-shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-sm opacity-40 group-hover:opacity-70 transition duration-300"></div>
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 dark:from-blue-400 dark:via-blue-500 dark:to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 break-words hyphens-auto leading-tight">{t('home.architecture.layer1.title')}</h3>
                    <div className="text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm lg:text-base break-words">{t('home.architecture.layer1.subtitle')}</div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4 sm:space-y-6">
                  <div className="flex items-start group/item">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2 mr-3 sm:mr-4 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-200"></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 sm:mb-2 break-words hyphens-auto">{t('home.architecture.layer1.feature1')}</div>
                      <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs sm:text-sm break-words">{t('home.architecture.layer1.feature1Desc')}</div>
                    </div>
                  </div>
                  <div className="flex items-start group/item">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2 mr-3 sm:mr-4 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-200"></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 sm:mb-2 break-words hyphens-auto">{t('home.architecture.layer1.feature2')}</div>
                      <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs sm:text-sm break-words">{t('home.architecture.layer1.feature2Desc')}</div>
                    </div>
                  </div>
                  <div className="flex items-start group/item">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2 mr-3 sm:mr-4 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-200"></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 sm:mb-2 break-words hyphens-auto">{t('home.architecture.layer1.feature3')}</div>
                      <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs sm:text-sm break-words">{t('home.architecture.layer1.feature3Desc')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl group-hover:from-blue-100 group-hover:to-cyan-100 dark:group-hover:from-blue-900/40 dark:group-hover:to-cyan-900/40 transition-all duration-300 border border-blue-100/50 dark:border-blue-700/30">
                  <div className="text-blue-800 dark:text-blue-200 font-medium leading-relaxed text-xs sm:text-sm break-words">{t('home.architecture.layer1.description')}</div>
                </div>
              </div>
            </div>
            
            {/* Layer 2: Value Confirmation */}
            <div className="group relative animate-slide-in-right animation-delay-200 h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/90 rounded-3xl p-4 sm:p-6 lg:p-12 shadow-2xl border border-purple-100/50 dark:border-purple-400/10 hover:shadow-purple-500/10 dark:hover:shadow-purple-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[580px]">
                <div className="flex items-start mb-6 sm:mb-8">
                  <div className="relative mr-4 sm:mr-6 flex-shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-sm opacity-40 group-hover:opacity-70 transition duration-300"></div>
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 dark:from-purple-400 dark:via-purple-500 dark:to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Award className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 break-words hyphens-auto leading-tight">{t('home.architecture.layer2.title')}</h3>
                    <div className="text-purple-600 dark:text-purple-400 font-semibold text-xs sm:text-sm lg:text-base break-words">{t('home.architecture.layer2.subtitle')}</div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4 sm:space-y-6">
                  <div className="flex items-start group/item">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 mr-3 sm:mr-4 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-200"></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 sm:mb-2 break-words hyphens-auto">{t('home.architecture.layer2.feature1')}</div>
                      <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs sm:text-sm break-words">{t('home.architecture.layer2.feature1Desc')}</div>
                    </div>
                  </div>
                  <div className="flex items-start group/item">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 mr-3 sm:mr-4 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-200"></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 sm:mb-2 break-words hyphens-auto">{t('home.architecture.layer2.feature2')}</div>
                      <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs sm:text-sm break-words">{t('home.architecture.layer2.feature2Desc')}</div>
                    </div>
                  </div>
                  <div className="flex items-start group/item">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-2 mr-3 sm:mr-4 flex-shrink-0 group-hover/item:scale-125 transition-transform duration-200"></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 sm:mb-2 break-words hyphens-auto">{t('home.architecture.layer2.feature3')}</div>
                      <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs sm:text-sm break-words">{t('home.architecture.layer2.feature3Desc')}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl group-hover:from-purple-100 group-hover:to-pink-100 dark:group-hover:from-purple-900/40 dark:group-hover:to-pink-900/40 transition-all duration-300 border border-purple-100/50 dark:border-purple-700/30">
                  <div className="text-purple-800 dark:text-purple-200 font-medium leading-relaxed text-xs sm:text-sm break-words">{t('home.architecture.layer2.description')}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Architecture Flow */}
          <div className="relative group">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-indigo-200/50 dark:border-indigo-400/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300/70 dark:hover:border-indigo-400/40">
              <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">{t('home.architecture.advantages.title')}</h3>
              
              <div className="grid md:grid-cols-4 gap-6 relative">
                <div className="text-center relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white font-bold text-lg">1</div>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('home.architecture.advantages.step1')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.architecture.advantages.step1Desc')}</p>
                  
                  {/* Arrow to next step - hidden on mobile */}
                  <div className="hidden md:block absolute top-8 right-0 transform translate-x-1/2 -translate-y-3">
                    <ArrowRight className="w-6 h-6 text-indigo-400" />
                  </div>
                  
                  {/* Mobile arrow after step 1 */}
                  <div className="md:hidden absolute left-1/2 transform -translate-x-1/2 -bottom-6 h-6 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-indigo-400 rotate-90" />
                  </div>
                </div>
                
                <div className="text-center relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white font-bold text-lg">2</div>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('home.architecture.advantages.step2')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.architecture.advantages.step2Desc')}</p>
                  
                  {/* Arrow to next step - hidden on mobile */}
                  <div className="hidden md:block absolute top-8 right-0 transform translate-x-1/2 -translate-y-3">
                    <ArrowRight className="w-6 h-6 text-purple-400" />
                  </div>
                  
                  {/* Mobile arrow after step 2 */}
                  <div className="md:hidden absolute left-1/2 transform -translate-x-1/2 -bottom-6 h-6 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-purple-400 rotate-90" />
                  </div>
                </div>
                
                <div className="text-center relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white font-bold text-lg">3</div>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('home.architecture.advantages.step3')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.architecture.advantages.step3Desc')}</p>
                  
                  {/* Arrow to next step - hidden on mobile */}
                  <div className="hidden md:block absolute top-8 right-0 transform translate-x-1/2 -translate-y-3">
                    <ArrowRight className="w-6 h-6 text-pink-400" />
                  </div>
                  
                  {/* Mobile arrow after step 3 */}
                  <div className="md:hidden absolute left-1/2 transform -translate-x-1/2 -bottom-6 h-6 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-pink-400 rotate-90" />
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-white font-bold text-lg">4</div>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('home.architecture.advantages.step4')}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('home.architecture.advantages.step4Desc')}</p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl group-hover:from-blue-100 group-hover:to-purple-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-purple-900/30 transition-all duration-300">
                <div className="text-center">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{t('home.architecture.advantages.conclusion')}</h4>
                  <p className="text-gray-600 dark:text-gray-400">{t('home.architecture.advantages.conclusionDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Core Features */}
      <section className="py-28 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-850/50 dark:to-slate-900">
        <PageContainer>
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-200/50 dark:border-indigo-600/30 mb-8 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Core Features</span>
            </div>
            
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-indigo-700 to-purple-700 dark:from-slate-100 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                {t('home.features.title')}
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up animation-delay-300">
            {/* Enhanced Feature Cards */}
            <div className="group relative animate-scale-in h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-blue-100/50 dark:border-blue-400/20 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[420px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 dark:from-blue-400 dark:via-blue-500 dark:to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.features.zkVersion.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.features.zkVersion.description')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group relative animate-scale-in animation-delay-100 h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-purple-100/50 dark:border-purple-400/20 hover:shadow-purple-500/10 dark:hover:shadow-purple-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[420px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 dark:from-purple-400 dark:via-purple-500 dark:to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Network className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.features.versionManagement.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.features.versionManagement.description')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group relative animate-scale-in animation-delay-200 h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-emerald-100/50 dark:border-emerald-400/20 hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[420px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.features.endorsementEconomy.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.features.endorsementEconomy.description')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group relative animate-scale-in animation-delay-300 h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-indigo-100/50 dark:border-indigo-400/20 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[420px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 dark:from-indigo-400 dark:via-indigo-500 dark:to-violet-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.features.personNFT.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.features.personNFT.description')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group relative animate-scale-in animation-delay-400 h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-orange-100/50 dark:border-orange-400/20 hover:shadow-orange-500/10 dark:hover:shadow-orange-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[420px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 dark:from-orange-400 dark:via-orange-500 dark:to-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Book className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.features.storySharding.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.features.storySharding.description')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group relative animate-scale-in animation-delay-500 h-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-red-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-rose-100/50 dark:border-rose-400/20 hover:shadow-rose-500/10 dark:hover:shadow-rose-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[420px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-rose-500 via-rose-600 to-red-600 dark:from-rose-400 dark:via-rose-500 dark:to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.features.versionNotarization.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.features.versionNotarization.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Tokenomics */}
      <section className="py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900">
        <PageContainer>
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200/50 dark:border-emerald-600/30 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Tokenomics</span>
            </div>
            
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-700 to-teal-700 dark:from-slate-100 dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent">
                {t('home.tokenomics.title')}
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              {t('home.tokenomics.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* DEEP Token */}
            <div className="group relative animate-scale-in">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-blue-100/50 dark:border-blue-400/20 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">D</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.tokenomics.deepToken.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {t('home.tokenomics.deepToken.description')}
                </p>
              </div>
            </div>

            {/* Token Supply */}
            <div className="group relative animate-scale-in animation-delay-100">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-emerald-100/50 dark:border-emerald-400/20 hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">∞</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.tokenomics.supply.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {t('home.tokenomics.supply.description')}
                </p>
              </div>
            </div>

            {/* Mining Rewards */}
            <div className="group relative animate-scale-in animation-delay-200">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-amber-100/50 dark:border-amber-400/20 hover:shadow-amber-500/10 dark:hover:shadow-amber-400/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">⛏</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.tokenomics.mining.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {t('home.tokenomics.mining.description')}
                </p>
              </div>
            </div>

            {/* Endorsement Fee */}
            <div className="group relative animate-scale-in animation-delay-300">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-purple-100/50 dark:border-purple-400/20 hover:shadow-purple-500/10 dark:hover:shadow-purple-400/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.tokenomics.endorsement.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {t('home.tokenomics.endorsement.description')}
                </p>
              </div>
            </div>

            {/* Fee Distribution */}
            <div className="group relative animate-scale-in animation-delay-400">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-teal-100/50 dark:border-teal-400/20 hover:shadow-teal-500/10 dark:hover:shadow-teal-400/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">%</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.tokenomics.distribution.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {t('home.tokenomics.distribution.description')}
                </p>
              </div>
            </div>

            {/* Economic Goal */}
            <div className="group relative animate-scale-in animation-delay-500">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-rose-100/50 dark:border-rose-400/20 hover:shadow-rose-500/10 dark:hover:shadow-rose-400/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">🎯</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.tokenomics.goal.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {t('home.tokenomics.goal.description')}
                </p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Audience */}
      <section className="py-28 bg-gradient-to-b from-white via-indigo-50/50 to-white dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-900">
        <PageContainer>
          <div className="text-center mb-20 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-200/50 dark:border-indigo-600/30 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Target Audience</span>
            </div>
            
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-indigo-700 to-purple-700 dark:from-slate-100 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                {t('home.audience.title')}
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
              {t('home.audience.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Data Contributors */}
            <div className="group relative animate-scale-in col-span-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-blue-100/50 dark:border-blue-400/20 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[400px]">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.audience.contributors.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-6">
                    {t('home.audience.contributors.description')}
                  </p>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('home.audience.contributors.benefit1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('home.audience.contributors.benefit2')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Family Researchers */}
            <div className="group relative animate-scale-in animation-delay-100 col-span-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-emerald-100/50 dark:border-emerald-400/20 hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[400px]">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Search className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.audience.researchers.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-6">
                    {t('home.audience.researchers.description')}
                  </p>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('home.audience.researchers.benefit1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('home.audience.researchers.benefit2')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Developers */}
            <div className="group relative animate-scale-in animation-delay-200 col-span-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-purple-100/50 dark:border-purple-400/20 hover:shadow-purple-500/10 dark:hover:shadow-purple-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[400px]">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Code className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.audience.developers.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-6">
                    {t('home.audience.developers.description')}
                  </p>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('home.audience.developers.benefit1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('home.audience.developers.benefit2')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Narrative Creators */}
            <div className="group relative animate-scale-in animation-delay-300 col-span-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-red-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-rose-100/50 dark:border-rose-400/20 hover:shadow-rose-500/10 dark:hover:shadow-rose-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[400px]">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <PenTool className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.audience.creators.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-6">
                    {t('home.audience.creators.description')}
                  </p>
                  <ul className="text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-rose-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('home.audience.creators.benefit1')}
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-rose-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {t('home.audience.creators.benefit2')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Call to Action */}
      <section className="pt-20 pb-24 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-650 dark:via-indigo-650 dark:to-purple-650 text-white overflow-x-hidden" style={{width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginBottom: '-5rem'}}>
        <PageContainer className="text-center">
          <h2 className="text-2xl sm:text-2xl md:text-4xl font-bold mb-6 px-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 dark:text-blue-200 mb-8 leading-relaxed px-4">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 px-4">
            <NavLink 
              to="/familyTree" 
              className="inline-flex items-center justify-center px-4 sm:px-8 py-3 sm:py-4 rounded-xl bg-white dark:bg-gray-50 text-blue-600 font-semibold text-sm sm:text-lg hover:bg-gray-100 dark:hover:bg-white transition-all duration-200 shadow-xl hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 dark:focus-visible:ring-offset-blue-700 whitespace-nowrap"
            >
              <span>{t('home.cta.experience')}</span>
            </NavLink>
            <NavLink 
              to="/search" 
              className="inline-flex items-center justify-center px-4 sm:px-8 py-3 sm:py-4 rounded-xl bg-blue-600 dark:bg-white/5 text-white font-semibold text-sm sm:text-lg border-2 border-white/90 dark:border-white/70 hover:bg-blue-700 dark:hover:bg-white/15 hover:text-white active:scale-[0.97] transition-all duration-200 shadow-inner/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 dark:focus-visible:ring-offset-blue-700 backdrop-blur-sm whitespace-nowrap"
            >
              <span>{t('home.cta.search', 'Search Family')}</span>
            </NavLink>
          </div>
          <div className="border-t border-white/20 pt-8 px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <a 
                href="https://github.com/deepfamilylabs/DeepFamily.git"
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 dark:focus-visible:ring-offset-blue-700 rounded"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                {t('home.cta.opensource')}
              </a>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-white/60">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                {t('home.cta.free')}
              </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                  </svg>
                  {t('home.cta.license')}
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  )
}


