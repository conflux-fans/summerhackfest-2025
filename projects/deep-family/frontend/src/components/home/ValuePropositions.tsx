import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, Coins, Book, Shield, Globe, Network, Key, GitBranch, Users, Gem, FileText } from 'lucide-react'
import { ANIMATION_CLASSES } from '../../constants/animationStyles'
import PageContainer from '../PageContainer'

const ValuePropositions = memo(() => {
  const { t } = useTranslation()

  return (
    <section className="py-28 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-850/50 dark:to-slate-900">
      <PageContainer>
        <div className={`text-center mb-20 ${ANIMATION_CLASSES.FADE_IN_UP}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-blue-900/30 border border-slate-200 dark:border-slate-700 mb-8 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Value Propositions</span>
          </div>
          
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
              {t('home.valueProps.title')}
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            {t('home.valueProps.subtitle')}
          </p>
        </div>
        
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${ANIMATION_CLASSES.FADE_IN_UP} animation-delay-300`}>
          {/* Zero-Knowledge Privacy */}
          <div className={`group relative ${ANIMATION_CLASSES.SCALE_IN} h-full`}>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-blue-100/50 dark:border-blue-400/20 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[320px]">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 dark:from-blue-400 dark:via-blue-500 dark:to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.valueProps.zkPrivacy.title')}</h3>
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {t('home.valueProps.zkPrivacy.description')}
                  </p>
                </div>
              </div>
            </div>
          {/* Salted Passphrase Unlinkability */}
          <div className={`group relative ${ANIMATION_CLASSES.SCALE_IN} animation-delay-100 h-full`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-purple-100/50 dark:border-purple-400/20 hover:shadow-purple-500/10 dark:hover:shadow-purple-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[320px]">
              <div className="relative mb-8">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 dark:from-purple-400 dark:via-purple-500 dark:to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Key className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.valueProps.saltedUnlinkability.title')}</h3>
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {t('home.valueProps.saltedUnlinkability.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Dual Tree Models */}
          <div className={`group relative ${ANIMATION_CLASSES.SCALE_IN} animation-delay-200 h-full`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-emerald-100/50 dark:border-emerald-400/20 hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[320px]">
              <div className="relative mb-8">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <GitBranch className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.valueProps.dualTreeModels.title')}</h3>
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {t('home.valueProps.dualTreeModels.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Community Endorsement */}
          <div className={`group relative ${ANIMATION_CLASSES.SCALE_IN} animation-delay-300 h-full`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-indigo-100/50 dark:border-indigo-400/20 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[320px]">
              <div className="relative mb-8">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 dark:from-indigo-400 dark:via-indigo-500 dark:to-violet-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.valueProps.communityEndorsement.title')}</h3>
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {t('home.valueProps.communityEndorsement.description')}
                </p>
              </div>
            </div>
          </div>

          {/* NFT Value Creation */}
          <div className={`group relative ${ANIMATION_CLASSES.SCALE_IN} animation-delay-400 h-full`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-orange-100/50 dark:border-orange-400/20 hover:shadow-orange-500/10 dark:hover:shadow-orange-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[320px]">
              <div className="relative mb-8">
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 dark:from-orange-400 dark:via-orange-500 dark:to-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Gem className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.valueProps.nftValueCreation.title')}</h3>
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {t('home.valueProps.nftValueCreation.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Story Sharding & Sealing */}
          <div className={`group relative ${ANIMATION_CLASSES.SCALE_IN} animation-delay-500 h-full`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-red-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800/95 rounded-3xl p-10 shadow-xl border border-rose-100/50 dark:border-rose-400/20 hover:shadow-rose-500/10 dark:hover:shadow-rose-400/20 transition-all duration-500 hover:-translate-y-3 backdrop-blur-sm h-full flex flex-col min-h-[320px]">
              <div className="relative mb-8">
                <div className="absolute -inset-2 bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-rose-500 via-rose-600 to-red-600 dark:from-rose-400 dark:via-rose-500 dark:to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg xl:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{t('home.valueProps.storyShardingSealing.title')}</h3>
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {t('home.valueProps.storyShardingSealing.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  )
})

ValuePropositions.displayName = 'ValuePropositions'

export default ValuePropositions