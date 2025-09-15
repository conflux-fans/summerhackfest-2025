import React, { useState, useRef, useCallback } from 'react'
import { useToast } from './ToastProvider'
import { useLongPress } from '../lib/hooks'
import { useTranslation } from 'react-i18next'
import { formatHashMiddle } from '../types/graph'

export function shortFirst4(hash: string): string {
  if (!hash) return ''
  return formatHashMiddle(hash, 6, 4)
}

export interface HashBadgeProps {
  hash: string
  onNavigate?: () => void
  className?: string
  size?: 'sm' | 'md'
  showTooltip?: boolean
  copyMsg?: string
}

const HashBadge: React.FC<HashBadgeProps> = ({ hash, onNavigate, className = '', size = 'md', showTooltip = true, copyMsg }) => {
  const { t } = useTranslation()
  const toast = useToast()
  const defaultCopyMsg = copyMsg || t('common.hashCopied', 'Hash copied')
  const [showTip, setShowTip] = useState(false)
  const containerRef = useRef<HTMLSpanElement | null>(null)
  const tipRef = useRef<HTMLSpanElement | null>(null)
  const lp = useLongPress(async () => { try { await navigator.clipboard.writeText(hash); toast.show(defaultCopyMsg) } catch {} })
  const copyHash = useCallback(async () => { try { await navigator.clipboard.writeText(hash); toast.show(defaultCopyMsg) } catch {} }, [hash, defaultCopyMsg, toast])
  const show = useCallback(() => { if (showTooltip) setShowTip(true) }, [showTooltip])
  const hideFromContainer: React.MouseEventHandler = useCallback((e) => {
    const next = e.relatedTarget as Node | null
    if (next && tipRef.current && tipRef.current.contains(next)) return
    setShowTip(false)
  }, [])
  const hideFromTip: React.MouseEventHandler = useCallback((e) => {
    const next = e.relatedTarget as Node | null
    if (next && containerRef.current && containerRef.current.contains(next)) return
    setShowTip(false)
  }, [])
  const baseSize = size === 'sm' ? 'w-24 h-8 text-sm' : 'w-28 h-10 text-base'
  return (
    <span ref={containerRef} className={`relative inline-block ${className}`}
          onMouseEnter={show}
          onMouseLeave={hideFromContainer}>
      <span
        className={`font-mono bg-white/60 backdrop-blur rounded border border-gray-200 shadow-sm cursor-pointer inline-flex items-center justify-center ${baseSize}`}
        onClick={onNavigate}
        onDoubleClick={copyHash}
        {...lp}
      >
        {shortFirst4(hash)}
      </span>
      {showTooltip && showTip && (
        <span ref={tipRef} className="absolute bottom-full left-1/2 -translate-x-1/2 whitespace-pre rounded bg-black text-white text-sm px-3 py-1 pointer-events-auto z-50 shadow-lg select-text"
              onMouseEnter={show}
              onMouseLeave={hideFromTip}
              onClick={copyHash}>
          {hash}
        </span>
      )}
    </span>
  )
}

export default React.memo(HashBadge)
