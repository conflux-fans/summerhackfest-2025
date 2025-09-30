import { LOADING_ANIMATIONS } from '../../constants/animationStyles';

const LoadingFallback = () => {
  return (
    <div className="py-28 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-850/50 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-700 mb-8 ${LOADING_ANIMATIONS.PULSE}`}>
            <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            <div className="w-24 h-4 bg-slate-300 dark:bg-slate-600 rounded"></div>
          </div>
          
          <div className={`w-96 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg mx-auto mb-6 ${LOADING_ANIMATIONS.PULSE}`}></div>
          <div className={`w-80 h-6 bg-slate-200 dark:bg-slate-700 rounded mx-auto ${LOADING_ANIMATIONS.PULSE}`}></div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <div key={index} className={`bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl ${LOADING_ANIMATIONS.PULSE}`}>
              <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl mb-8"></div>
              <div className="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoadingFallback