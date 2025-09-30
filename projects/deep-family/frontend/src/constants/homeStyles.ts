// Home page style constants
export const HERO_STYLES = {
  section: "relative min-h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50/50 via-blue-50/50 to-indigo-100/50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-800 flex items-center bg-mesh-pattern dark:bg-mesh-pattern-dark",
  container: "relative text-center",
  backgroundOverlay: "absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600/5 via-purple-600/8 to-indigo-600/5 dark:from-blue-600/15 dark:via-purple-700/20 dark:to-indigo-700/15",
  gradientOverlay: "absolute inset-0 w-full h-full bg-gradient-radial from-transparent via-transparent to-white/5 dark:to-slate-900/10"
} as const

// Floating shape styles
export const FLOATING_SHAPES = [
  { className: "absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/25 to-cyan-500/15 dark:from-blue-500/35 dark:to-cyan-500/25 rounded-full blur-2xl animate-float" },
  { className: "absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/15 dark:from-purple-600/30 dark:to-pink-600/25 rounded-full blur-2xl animate-pulse-soft" },
  { className: "absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-br from-indigo-500/25 to-blue-500/15 dark:from-indigo-600/35 dark:to-blue-600/25 rounded-full blur-2xl animate-bounce-gentle" },
  { className: "absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-emerald-500/20 to-teal-500/15 dark:from-emerald-600/30 dark:to-teal-600/25 rounded-full blur-xl animate-float delay-1000" }
] as const

// Tag strip styles
export const TAG_STRIP_STYLES = {
  container: "animate-fade-in-up animation-delay-500 mb-16",
  wrapper: "flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 max-w-6xl mx-auto px-2 sm:px-4",
  tagBase: "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm flex-shrink-0 min-w-0",
  dotBase: "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse flex-shrink-0",
  text: "text-[10px] sm:text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap"
} as const

// CTA button styles
export const CTA_BUTTON_STYLES = {
  container: "animate-fade-in-up animation-delay-400 flex flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-6 mb-16 px-2 sm:px-4 max-w-6xl mx-auto",
  primaryButton: "group relative inline-flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-xs sm:text-sm md:text-base lg:text-lg hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-600 dark:hover:from-blue-400 dark:hover:to-purple-500 transform hover:scale-105 transition-all duration-300 shadow-xl sm:shadow-2xl hover:shadow-blue-500/25 dark:shadow-blue-500/10 dark:hover:shadow-blue-400/20 overflow-hidden whitespace-nowrap flex-shrink-0",
  secondaryButton: "group inline-flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 md:py-4 lg:py-5 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm md:text-base lg:text-lg border-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all duration-300 backdrop-blur-sm whitespace-nowrap flex-shrink-0",
  blueSecondary: "border-blue-200/80 dark:border-purple-400/60 hover:border-blue-400/80 dark:hover:border-purple-400/80 hover:shadow-blue-500/10 dark:hover:shadow-purple-500/20",
  greenSecondary: "border-green-200/80 dark:border-green-400/60 hover:border-green-400/80 dark:hover:border-green-400/80 hover:shadow-green-500/10 dark:hover:shadow-green-500/20",
  overlay: "absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
  content: "relative flex items-center gap-1.5 sm:gap-2 lg:gap-3 justify-center",
  text: "text-xs sm:text-sm md:text-base lg:text-lg"
} as const

// Hero content styles
export const HERO_CONTENT_STYLES = {
  badge: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-600/30 mb-8 backdrop-blur-sm",
  badgeIcon: "w-4 h-4 text-blue-600 dark:text-blue-400",
  badgeText: "text-sm font-medium text-blue-700 dark:text-blue-300",
  title: "text-3xl sm:text-2xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight tracking-tight px-4 break-words hyphens-auto",
  titleGradient: "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent",
  subtitle: "text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-2xl text-gray-600 dark:text-gray-400 max-w-5xl mx-auto mb-12 leading-relaxed font-light px-4 break-words hyphens-auto"
} as const

// Tag data
export const TAG_DATA = [
  { 
    key: 'protocol', 
    color: 'blue',
    borderClass: 'border-blue-200/50 dark:border-blue-600/30',
    dotClass: 'bg-blue-500'
  },
  { 
    key: 'incentive', 
    color: 'purple',
    borderClass: 'border-purple-200/50 dark:border-purple-600/30',
    dotClass: 'bg-purple-500'
  },
  { 
    key: 'nft', 
    color: 'violet',
    borderClass: 'border-violet-200/50 dark:border-violet-600/30',
    dotClass: 'bg-violet-500'
  },
  { 
    key: 'zk', 
    color: 'emerald',
    borderClass: 'border-emerald-200/50 dark:border-emerald-600/30',
    dotClass: 'bg-emerald-500'
  }
] as const

// Button configuration type
export interface ButtonConfig {
  to: string
  icon: 'Users' | 'Network' | 'Search'
  text: string
  className: string
  hasOverlay: boolean
}