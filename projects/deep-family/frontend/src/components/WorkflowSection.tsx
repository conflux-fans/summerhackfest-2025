import React from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'

const WorkflowSection: React.FC = () => {
  const { t } = useTranslation()

  const steps = [
    {
      number: 1,
      title: t('home.valueSystem.advantages.step1', 'Add Person Version'),
      description: t('home.valueSystem.advantages.step1Desc', 'If both parents exist → receive mining rewards'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: 2,
      title: t('home.valueSystem.advantages.step2', 'Community Endorsement'),
      description: t('home.valueSystem.advantages.step2Desc', 'Pay DEEP tokens to endorse a version'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      number: 3,
      title: t('home.valueSystem.advantages.step3', 'Mint Version NFT'),
      description: t('home.valueSystem.advantages.step3Desc', 'Endorsers can mint NFTs for corresponding versions'),
      color: 'from-pink-500 to-pink-600'
    },
    {
      number: 4,
      title: t('home.valueSystem.advantages.step4', 'Write Story Shards'),
      description: t('home.valueSystem.advantages.step4Desc', 'NFT holders write/append person story fragments'),
      color: 'from-red-500 to-red-600'
    },
    {
      number: 5,
      title: t('home.valueSystem.advantages.step5', 'Story Sealing'),
      description: t('home.valueSystem.advantages.step5Desc', 'Seal stories to form immutable on-chain historical records'),
      color: 'from-orange-500 to-orange-600'
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('home.valueSystem.advantages.title', 'Workflow Process')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('home.valueSystem.advantages.subtitle', 'Five-step value discovery and consensus formation mechanism')}
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-105 h-full flex flex-col">
                  {/* Step Number */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  
                  {/* Step Content */}
                  <div className="text-center flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Arrow (hidden on last item and mobile) - Centered between cards */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 -right-3 translate-x-1/2 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-700">
                      <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Conclusion */}
          <div className="bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-900/20 dark:via-purple-900/15 dark:to-pink-900/20 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('home.valueSystem.advantages.conclusion', 'Value-driven collaborative network')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t('home.valueSystem.advantages.conclusionDesc', 'Through economic incentive mechanisms, achieve natural accumulation and value discovery of high-quality genealogy data')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WorkflowSection