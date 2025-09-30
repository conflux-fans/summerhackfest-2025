import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CallToAction = memo(() => {
  const { t } = useTranslation();

  return (
    <section className="pt-20 pb-24 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-650 dark:via-indigo-650 dark:to-purple-650 text-white overflow-x-hidden w-full" style={{width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginBottom: '-5rem'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-2xl md:text-4xl font-bold mb-6 px-4">
          {t('home.cta.title')}
        </h2>
        <p className="text-lg sm:text-xl text-blue-100 dark:text-blue-200 mb-8 leading-relaxed px-4">
          {t('home.cta.subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 px-4">
          <NavLink 
            to="/actions" 
            className="group inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {t('home.cta.startButton')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </NavLink>
          
          <NavLink 
            to="/familyTree" 
            className="group inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
          >
            {t('home.cta.exploreButton')}
          </NavLink>
        </div>
        
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-blue-100 dark:text-blue-200">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('home.cta.privacy')}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {t('home.cta.security')}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              {t('home.cta.license')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

CallToAction.displayName = 'CallToAction';

export default CallToAction;