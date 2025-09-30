import React from 'react';
import { LOADING_ANIMATIONS } from '../constants/animationStyles';

interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

export default function LoadingSkeleton({ lines = 4, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`} aria-busy="true" aria-live="polite">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-gray-100 ${LOADING_ANIMATIONS.PULSE} rounded ${i === 1 ? 'w-5/6' : i === 2 ? 'w-2/3' : i === 3 ? 'w-1/2' : 'w-full'}`}
        />
      ))}
    </div>
  )
}
