import { memo, lazy, Suspense, useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { LOADING_ANIMATIONS } from '../../constants/animationStyles'

// Type definition for dynamically imported icons
type IconName = 
  | 'Shield' 
  | 'Coins' 
  | 'Network' 
  | 'TrendingUp' 
  | 'Users' 
  | 'Globe' 
  | 'Zap'
  | 'ArrowRight'
  | 'Sparkles'
  | 'Lock'
  | 'Award'
  | 'Book'
  | 'Search'
  | 'Code'
  | 'PenTool'

interface DynamicIconProps {
  name: IconName
  className?: string
  size?: number
}

// Icon mapping using dynamic imports
const iconMap: Record<IconName, () => Promise<{ default: LucideIcon }>> = {
  Shield: () => import('lucide-react').then(mod => ({ default: mod.Shield })),
  Coins: () => import('lucide-react').then(mod => ({ default: mod.Coins })),
  Network: () => import('lucide-react').then(mod => ({ default: mod.Network })),
  TrendingUp: () => import('lucide-react').then(mod => ({ default: mod.TrendingUp })),
  Users: () => import('lucide-react').then(mod => ({ default: mod.Users })),
  Globe: () => import('lucide-react').then(mod => ({ default: mod.Globe })),
  Zap: () => import('lucide-react').then(mod => ({ default: mod.Zap })),
  ArrowRight: () => import('lucide-react').then(mod => ({ default: mod.ArrowRight })),
  Sparkles: () => import('lucide-react').then(mod => ({ default: mod.Sparkles })),
  Lock: () => import('lucide-react').then(mod => ({ default: mod.Lock })),
  Award: () => import('lucide-react').then(mod => ({ default: mod.Award })),
  Book: () => import('lucide-react').then(mod => ({ default: mod.Book })),
  Search: () => import('lucide-react').then(mod => ({ default: mod.Search })),
  Code: () => import('lucide-react').then(mod => ({ default: mod.Code })),
  PenTool: () => import('lucide-react').then(mod => ({ default: mod.PenTool }))
}

// Create lazy loaded icon component
const createLazyIcon = (iconName: IconName) => {
  return lazy(async () => {
    const { default: IconComponent } = await iconMap[iconName]()
    return {
      default: memo<{ className?: string; size?: number }>(({ className, size = 24 }) => (
        <IconComponent className={className} size={size} />
      ))
    }
  })
}

// Icon loading placeholder
const IconFallback = memo<{ className?: string; size?: number }>(({ className, size = 24 }) => (
  <div 
    className={`inline-block bg-gray-200 dark:bg-gray-700 rounded ${LOADING_ANIMATIONS.PULSE} ${className}`}
    style={{ width: size, height: size }}
  />
))

// Main dynamic icon component
export const DynamicIcon = memo<DynamicIconProps>(({ name, className, size = 24 }) => {
  const LazyIcon = useMemo(() => createLazyIcon(name), [name])
  
  return (
    <Suspense fallback={<IconFallback className={className} size={size} />}>
      <LazyIcon className={className} size={size} />
    </Suspense>
  )
})

DynamicIcon.displayName = 'DynamicIcon'