import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Search, Code, PenTool } from 'lucide-react';
import { ANIMATION_CLASSES } from '../../constants/animationStyles';
import PageContainer from '../PageContainer';

const Audience = memo(() => {
  const { t } = useTranslation();

  return (
    <section className="py-28 bg-gradient-to-b from-white via-indigo-50/50 to-white dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-900">
      <PageContainer>
        <div className={`text-center mb-20 ${ANIMATION_CLASSES.FADE_IN_UP}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 border border-indigo-200/50 dark:border-indigo-600/30 mb-8 backdrop-blur-sm">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Target Audience</span>
          </div>
          
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-slate-900 via-indigo-700 to-blue-700 dark:from-slate-100 dark:via-indigo-300 dark:to-blue-300 bg-clip-text text-transparent">
              {t('home.audience.title')}
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            {t('home.audience.subtitle')}
          </p>
        </div>
        
        <div className={`grid md:grid-cols-2 gap-8 ${ANIMATION_CLASSES.FADE_IN_UP} animation-delay-300`}>
          {/* Data Contributors */}
          <div className={`group relative ${ANIMATION_CLASSES.SLIDE_IN_LEFT}`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-2xl border border-blue-100/50 dark:border-blue-400/20 hover:shadow-blue-500/20 dark:hover:shadow-blue-400/30 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 dark:from-blue-400 dark:via-blue-500 dark:to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {t('home.audience.contributors.title')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 bg-blue-500 rounded-full ${ANIMATION_CLASSES.PULSE_SOFT}`}></div>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Primary Users</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base lg:text-lg">
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

          {/* Family Researchers */}
          <div className={`group relative ${ANIMATION_CLASSES.SLIDE_IN_RIGHT}`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-2xl border border-purple-100/50 dark:border-purple-400/20 hover:shadow-purple-500/20 dark:hover:shadow-purple-400/30 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 dark:from-purple-400 dark:via-purple-500 dark:to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {t('home.audience.researchers.title')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 bg-purple-500 rounded-full ${ANIMATION_CLASSES.PULSE_SOFT}`}></div>
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Active Users</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base lg:text-lg">
                {t('home.audience.researchers.description')}
              </p>
              
              <ul className="text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('home.audience.researchers.benefit1')}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('home.audience.researchers.benefit2')}
                </li>
              </ul>
            </div>
          </div>

          {/* Developers */}
          <div className={`group relative ${ANIMATION_CLASSES.SLIDE_IN_LEFT} animation-delay-200`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-2xl border border-emerald-100/50 dark:border-emerald-400/20 hover:shadow-emerald-500/20 dark:hover:shadow-emerald-400/30 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {t('home.audience.developers.title')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 bg-emerald-500 rounded-full ${ANIMATION_CLASSES.PULSE_SOFT}`}></div>
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Builders</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base lg:text-lg">
                {t('home.audience.developers.description')}
              </p>
              
              <ul className="text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('home.audience.developers.benefit1')}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('home.audience.developers.benefit2')}
                </li>
              </ul>
            </div>
          </div>

          {/* Narrative Creators */}
          <div className={`group relative ${ANIMATION_CLASSES.SLIDE_IN_RIGHT} animation-delay-200`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-2xl border border-orange-100/50 dark:border-orange-400/20 hover:shadow-orange-500/20 dark:hover:shadow-orange-400/30 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 dark:from-orange-400 dark:via-orange-500 dark:to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <PenTool className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {t('home.audience.creators.title')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 bg-orange-500 rounded-full ${ANIMATION_CLASSES.PULSE_SOFT}`}></div>
                    <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">Storytellers</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base lg:text-lg">
                {t('home.audience.creators.description')}
              </p>
              
              <ul className="text-gray-600 dark:text-gray-300 space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('home.audience.creators.benefit1')}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t('home.audience.creators.benefit2')}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
});

Audience.displayName = 'Audience';

export default Audience;