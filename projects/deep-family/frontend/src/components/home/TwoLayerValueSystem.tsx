import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Zap, CheckCircle, Eye, Database, Globe, ArrowRight } from 'lucide-react';
import { ANIMATION_CLASSES } from '../../constants/animationStyles';
import PageContainer from '../PageContainer';

const TwoLayerValueSystem = memo(() => {
  const { t } = useTranslation();

  return (
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
        <div className={`text-center mb-20 ${ANIMATION_CLASSES.FADE_IN_UP}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-800 dark:to-blue-900/30 border border-slate-200 dark:border-slate-700 mb-6 backdrop-blur-sm">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Two-Layer Value System</span>
          </div>

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 dark:from-slate-100 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
              {t('home.valueSystem.title')}
            </span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
            {t('home.valueSystem.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Layer 1: Privacy Protection */}
          <div className={`group relative ${ANIMATION_CLASSES.SLIDE_IN_LEFT}`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-2xl border border-blue-100/50 dark:border-blue-400/20 hover:shadow-blue-500/20 dark:hover:shadow-blue-400/30 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 dark:from-blue-400 dark:via-blue-500 dark:to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {t('home.valueSystem.layer1.title')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 bg-blue-500 rounded-full ${ANIMATION_CLASSES.PULSE_SOFT}`}></div>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Layer 1 - Hash Storage</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base lg:text-lg">
                {t('home.valueSystem.layer1.description')}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm lg:text-base">{t('home.valueSystem.layer1.feature1')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm lg:text-base">{t('home.valueSystem.layer1.feature2')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm lg:text-base">{t('home.valueSystem.layer1.feature3')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 2: Public NFT Assets */}
          <div className={`group relative ${ANIMATION_CLASSES.SLIDE_IN_RIGHT}`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-2xl border border-purple-100/50 dark:border-purple-400/20 hover:shadow-purple-500/20 dark:hover:shadow-purple-400/30 transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 dark:from-purple-400 dark:via-purple-500 dark:to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {t('home.valueSystem.layer2.title')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 bg-purple-500 rounded-full ${ANIMATION_CLASSES.PULSE_SOFT}`}></div>
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">Layer 2 - Public Assets</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-base lg:text-lg">
                {t('home.valueSystem.layer2.description')}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm lg:text-base">{t('home.valueSystem.layer2.feature1')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm lg:text-base">{t('home.valueSystem.layer2.feature2')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 text-sm lg:text-base">{t('home.valueSystem.layer2.feature3')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Flow Visualization - Redesigned */}
        <div className={`mt-24 ${ANIMATION_CLASSES.FADE_IN_UP} ${ANIMATION_CLASSES.DELAY_500}`}>
          <div className="text-center mb-16">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('home.valueSystem.flow.title')}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('home.valueSystem.flow.description')}
            </p>
          </div>

          <div className="relative">
            {/* Enhanced Flow Connection */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center justify-center z-10">
              <div className="flex items-center gap-2">
                {/* Arrow */}
                <div className="mx-3 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                  <ArrowRight className="w-5 h-5 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Step 1 - Enhanced Design */}
              <div className="group relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-slate-700/50 rounded-3xl p-8 shadow-xl border border-blue-100 dark:border-blue-700/30 backdrop-blur-sm group-hover:shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-500 group-hover:-translate-y-2">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition duration-300"></div>
                      <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <Shield className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      {t('home.valueSystem.flow.step1')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {t('home.valueSystem.flow.step1Desc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 - Enhanced Design */}
              <div className="group relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-slate-700/50 rounded-3xl p-8 shadow-xl border border-purple-100 dark:border-purple-700/30 backdrop-blur-sm group-hover:shadow-2xl group-hover:shadow-purple-500/20 transition-all duration-500 group-hover:-translate-y-2">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="absolute -inset-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition duration-300"></div>
                      <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <Eye className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                      {t('home.valueSystem.flow.step2')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {t('home.valueSystem.flow.step2Desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Tree Models - Completely Redesigned */}
        <div className={`mt-28 ${ANIMATION_CLASSES.FADE_IN_UP} ${ANIMATION_CLASSES.DELAY_600}`}>
          <div className="text-center mb-16">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('home.valueSystem.dualModels.title')}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('home.valueSystem.dualModels.description')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Public Tree */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-xl border border-emerald-100/50 dark:border-emerald-400/20 hover:shadow-emerald-500/20 dark:hover:shadow-emerald-400/30 transition-all duration-500 hover:-translate-y-2">
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {t('home.valueSystem.dualModels.public.title')}
                    </h4>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium">
                      <Zap className="w-4 h-4" />
                      {t('home.valueSystem.dualModels.public.benefit')}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base lg:text-lg mb-6">
                  {t('home.valueSystem.dualModels.public.description')}
                </p>

                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700/30">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium text-sm">
                    {t('home.valueSystem.dualModels.public.mode')}
                  </span>
                </div>
              </div>
            </div>

            {/* Private Tree */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-3xl p-8 lg:p-10 shadow-xl border border-blue-100/50 dark:border-blue-400/20 hover:shadow-blue-500/20 dark:hover:shadow-blue-400/30 transition-all duration-500 hover:-translate-y-2">
                <div className="flex items-start gap-4 mb-6">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {t('home.valueSystem.dualModels.private.title')}
                    </h4>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                      <Shield className="w-4 h-4" />
                      {t('home.valueSystem.dualModels.private.benefit')}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base lg:text-lg mb-6">
                  {t('home.valueSystem.dualModels.private.description')}
                </p>

                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-700/30">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium text-sm">
                    {t('home.valueSystem.dualModels.private.mode')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
});

TwoLayerValueSystem.displayName = 'TwoLayerValueSystem';

export default TwoLayerValueSystem;