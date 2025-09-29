import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Zap, Lock, Network, TrendingUp, Award, Book, Shield } from 'lucide-react'
import { ANIMATION_CLASSES } from '../../constants/animationStyles'
import PageContainer from '../PageContainer'

const CoreFeatures = memo(() => {
  const { t } = useTranslation()

  return (
    <section className="py-28 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-850/50 dark:to-slate-900">
      <PageContainer>
        <div className={`text-center mb-20 ${ANIMATION_CLASSES.FADE_IN_UP}`}>
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
        
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${ANIMATION_CLASSES.FADE_IN_UP} animation-delay-300`}>
          {/* Enhanced Feature Cards */}
          <div className={`group relative ${ANIMATION_CLASSES.SCALE_IN} h-full`}>
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
          
          <div className={`group relative ${ANIMATION_CLASSES.SCALE_IN} animation-delay-100 h-full`}>
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
          
          <div className={`group relative ${ANIMATION_CLASSES.SCALE_IN} animation-delay-200 h-full`}>
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
          
          <div className={`group relative ${ANIMATION_CLASSES.SCALE_IN} animation-delay-300 h-full`}>
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
          
          <div className={`group relative ${ANIMATION_CLASSES.SCALE_IN} animation-delay-400 h-full`}>
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
          
          <div className={`group relative ${ANIMATION_CLASSES.SCALE_IN} animation-delay-500 h-full`}>
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
  )
})

CoreFeatures.displayName = 'CoreFeatures'

export default CoreFeatures