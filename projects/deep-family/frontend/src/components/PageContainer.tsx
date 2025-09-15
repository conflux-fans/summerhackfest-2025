import React from 'react'

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * width preset
   * default: matches existing layout (max-w-7xl)
   * narrow: for forms or focused content
   * wide: for data-heavy (max-w-screen-xl)
   * full: for full width (w-full max-w-none)
   */
  size?: 'default' | 'narrow' | 'wide' | 'full'
  /** disable horizontal padding if you want full-bleed children */
  noPadding?: boolean
}

const sizeMap: Record<NonNullable<PageContainerProps['size']>, string> = {
  default: 'max-w-7xl',
  narrow: 'max-w-3xl',
  wide: 'max-w-screen-xl',
  full: 'w-full max-w-none'
}

export default function PageContainer({
  size = 'default',
  noPadding = false,
  className = '',
  children,
  ...rest
}: PageContainerProps) {
  return (
    <div
      className={`${sizeMap[size]} mx-auto ${noPadding ? '' : 'px-4 sm:px-6 lg:px-8'} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
