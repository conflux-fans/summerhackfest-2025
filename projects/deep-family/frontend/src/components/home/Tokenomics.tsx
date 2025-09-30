import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, TrendingUp, Award, Target } from 'lucide-react';
import { ANIMATION_CLASSES } from '../../constants/animationStyles';
import PageContainer from '../PageContainer';

const Tokenomics = memo(() => {
  const { t } = useTranslation();

  return (
    <section className="py-28 bg-gradient-to-b from-white via-purple-50/50 to-white dark:from-slate-900 dark:via-purple-950/50 dark:to-slate-900">
      <PageContainer>
        <div className={`text-center mb-20 ${ANIMATION_CLASSES.FADE_IN_UP}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-600/30 mb-8 backdrop-blur-sm">
            <Coins className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Tokenomics</span>
          </div>
          
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-slate-900 via-purple-700 to-pink-700 dark:from-slate-100 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
              {t('home.tokenomics.title')}
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            {t('home.tokenomics.subtitle')}
          </p>
        </div>
        
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 ${ANIMATION_CLASSES.FADE_IN_UP} animation-delay-300`}>
          {/* DEEP Token */}
          <div className={`group relative h-full ${ANIMATION_CLASSES.SCALE_IN}`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-purple-100/50 dark:border-purple-400/20 hover:shadow-purple-500/10 dark:hover:shadow-purple-400/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm h-full flex flex-col">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Coins className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.tokenomics.deepToken.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base flex-1">
                  {t('home.tokenomics.deepToken.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Token Supply */}
          <div className={`group relative h-full ${ANIMATION_CLASSES.SCALE_IN}`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-blue-100/50 dark:border-blue-400/20 hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm h-full flex flex-col">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">💎</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.tokenomics.supply.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base flex-1">
                  {t('home.tokenomics.supply.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Mining Rewards */}
          <div className={`group relative h-full ${ANIMATION_CLASSES.SCALE_IN} animation-delay-200`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-emerald-100/50 dark:border-emerald-400/20 hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm h-full flex flex-col">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.tokenomics.mining.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base flex-1">
                  {t('home.tokenomics.mining.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Endorsement Fee */}
          <div className={`group relative h-full ${ANIMATION_CLASSES.SCALE_IN} animation-delay-300`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-indigo-100/50 dark:border-indigo-400/20 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-400/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm h-full flex flex-col">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-white">💰</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.tokenomics.endorsement.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base flex-1">
                  {t('home.tokenomics.endorsement.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Fee Distribution */}
          <div className={`group relative h-full ${ANIMATION_CLASSES.SCALE_IN} animation-delay-400`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-orange-100/50 dark:border-orange-400/20 hover:shadow-orange-500/10 dark:hover:shadow-orange-400/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm h-full flex flex-col">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.tokenomics.distribution.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base flex-1">
                  {t('home.tokenomics.distribution.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Economic Goal */}
          <div className={`group relative h-full ${ANIMATION_CLASSES.SCALE_IN} animation-delay-500`}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-red-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800/95 rounded-2xl p-8 shadow-xl border border-rose-100/50 dark:border-rose-400/20 hover:shadow-rose-500/10 dark:hover:shadow-rose-400/20 transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm h-full flex flex-col">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('home.tokenomics.goal.title')}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base flex-1">
                  {t('home.tokenomics.goal.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
});

Tokenomics.displayName = 'Tokenomics';

export default Tokenomics;