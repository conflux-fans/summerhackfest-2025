// Animation and transition constants for consistent styling
export const ANIMATION_CLASSES = {
  // Entrance animations
  FADE_IN_UP: 'animate-fade-in-up',
  SLIDE_IN_RIGHT: 'animate-slide-in-right',
  SLIDE_IN_LEFT: 'animate-slide-in-left',
  SCALE_IN: 'animate-scale-in',
  
  // Continuous animations
  FLOAT: 'animate-float',
  PULSE_SOFT: 'animate-pulse-soft',
  BOUNCE_GENTLE: 'animate-bounce-gentle',
  SPIN: 'animate-spin',
  
  // Animation delays
  DELAY_200: 'animation-delay-200',
  DELAY_500: 'animation-delay-500',
  DELAY_600: 'animation-delay-600',
  DELAY_1000: 'delay-1000',
} as const;

export const TRANSITION_CLASSES = {
  // Basic transitions
  COLORS: 'transition-colors',
  ALL: 'transition-all',
  TRANSFORM: 'transition-transform',
  OPACITY: 'transition-opacity',
  
  // Duration variants
  DURATION_150: 'duration-150',
  DURATION_200: 'duration-200',
  DURATION_300: 'duration-300',
  
  // Common transition combinations
  COLORS_DURATION_150: 'transition-colors duration-150',
  ALL_DURATION_200: 'transition-all duration-200',
  ALL_DURATION_300: 'transition-all duration-300',
  TRANSFORM_DURATION_300: 'transition-transform duration-300',
  OPACITY_DURATION_200: 'transition-opacity duration-200',
} as const;

export const HOVER_EFFECTS = {
  // Scale effects
  SCALE_110: 'hover:scale-110',
  SCALE_105: 'hover:scale-105',
  
  // Transform effects
  TRANSLATE_Y_NEG_1: 'hover:-translate-y-1',
  TRANSLATE_Y_NEG_2: 'hover:-translate-y-2',
  
  // Shadow effects
  SHADOW_XL: 'hover:shadow-xl',
  SHADOW_3XL: 'hover:shadow-3xl',
  SHADOW_LG: 'hover:shadow-lg',
  SHADOW_MD: 'hover:shadow-md',
  
  // Background effects
  BG_GRAY_50: 'hover:bg-gray-50',
  BG_GRAY_100: 'hover:bg-gray-100',
  BG_BLUE_50: 'hover:bg-blue-50',
  BG_BLUE_100: 'hover:bg-blue-100',
} as const;

// Performance-optimized animation styles
export const PERFORMANCE_OPTIMIZED_STYLES = {
  // Hardware acceleration
  HARDWARE_ACCELERATED: 'transform-gpu will-change-transform',
  
  // Composite layers
  COMPOSITE_LAYER: 'transform-gpu backface-hidden',
  
  // Smooth animations
  SMOOTH_TRANSFORM: 'transform-gpu transition-transform duration-300 ease-out',
  SMOOTH_OPACITY: 'transition-opacity duration-200 ease-out',
  
  // Optimized hover states
  OPTIMIZED_HOVER: 'transform-gpu transition-all duration-200 ease-out hover:scale-105',
} as const;

// Card animation styles
export const CARD_ANIMATIONS = {
  BASE: 'transition-all duration-300',
  HOVER_LIFT: 'hover:-translate-y-1 hover:shadow-xl',
  HOVER_LIFT_STRONG: 'hover:-translate-y-2 hover:shadow-3xl',
  SCALE_ON_HOVER: 'hover:scale-105 transition-transform duration-300',
  BACKDROP_BLUR: 'backdrop-blur-xl',
} as const;

// Button animation styles
export const BUTTON_ANIMATIONS = {
  BASE: 'transition-all duration-200',
  HOVER_SCALE: 'hover:scale-105',
  HOVER_SHADOW: 'hover:shadow-md',
  ACTIVE_SCALE: 'active:scale-95',
  FOCUS_RING: 'focus:outline-none focus:ring-2 focus:ring-blue-500/60',
} as const;

// Loading animation styles
export const LOADING_ANIMATIONS = {
  PULSE: 'animate-pulse',
  SPIN: 'animate-spin',
  BOUNCE: 'animate-bounce',
  SKELETON: 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
} as const;