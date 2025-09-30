import React from 'react'
import { createPortal } from 'react-dom'
import { X, Clipboard, ChevronRight, Edit2, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NodeData, birthDateString, deathDateString, genderText as genderTextFn, isMinted, formatUnixSeconds, shortAddress, formatHashMiddle } from '../types/graph'
import { useNavigate } from 'react-router-dom'
import { useTreeData } from '../context/TreeDataContext'


export default function NodeDetailModal({
  open,
  onClose,
  nodeData,
  fallback,
  loading,
  error,
}: {
  open: boolean
  onClose: () => void
  nodeData?: NodeData | null
  fallback: { hash: string; versionIndex?: number }
  loading?: boolean
  error?: string | null
}) {
  const { t } = useTranslation()
  // Track close origin to coordinate with history state
  const pushedRef = React.useRef(false)
  const closedBySelfRef = React.useRef(false)
  const closedByPopRef = React.useRef(false)
  const copyText = React.useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch {}
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.focus(); ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }, [])
  const [centerHint, setCenterHint] = React.useState<string | null>(null)
  const [entered, setEntered] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const [dragOffset, setDragOffset] = React.useState(0)
  const startYRef = React.useRef<number | null>(null)
  const navigate = useNavigate()
  const { getOwnerOf } = useTreeData()
  const [owner, setOwner] = React.useState<string | undefined>(nodeData?.owner)
  const [isDesktop, setIsDesktop] = React.useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia('(min-width: 640px)').matches
  })
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia('(min-width: 640px)')
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop((e as MediaQueryListEvent).matches ?? (e as MediaQueryList).matches)
    try {
      mql.addEventListener('change', onChange as any)
    } catch {
      // Safari
      ;(mql as any).addListener(onChange)
    }
    onChange(mql as any)
    return () => {
      try {
        mql.removeEventListener('change', onChange as any)
      } catch {
        ;(mql as any).removeListener(onChange)
      }
    }
  }, [])
  const handleClose = React.useCallback(() => {
    closedBySelfRef.current = true
    onClose()
  }, [onClose])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, handleClose])

  // Push a history state on open so mobile back closes modal first
  React.useEffect(() => {
    if (!open) return
    try {
      window.history.pushState({ __dfNodeDetailModal: true }, '')
      pushedRef.current = true
    } catch {}
    const onPop = () => {
      // Back pressed: close modal without adding another back
      closedByPopRef.current = true
      onClose()
    }
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      // If user closed via modal (click overlay/drag/Escape/button) and we pushed a state,
      // consume the extra history entry so URL stays at the same route.
      if (pushedRef.current && closedBySelfRef.current && !closedByPopRef.current) {
        try { window.history.back() } catch {}
      }
      pushedRef.current = false
      closedBySelfRef.current = false
      closedByPopRef.current = false
    }
  }, [open, onClose])
  // Lock background scroll
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])
  // Enter animation
  React.useEffect(() => { if (open) { requestAnimationFrame(() => setEntered(true)) } else { setEntered(false) } }, [open])
  // Keep local owner state in sync and fetch if missing
  React.useEffect(() => { setOwner(nodeData?.owner) }, [nodeData?.owner])
  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!open) return
        if (!nodeData?.tokenId || nodeData.tokenId === '0') return
        if (owner) return
        const addr = await getOwnerOf(String(nodeData.tokenId))
        if (!cancelled) setOwner(addr || undefined)
      } catch {
        if (!cancelled) setOwner(undefined)
      }
    })()
    return () => { cancelled = true }
  }, [open, nodeData?.tokenId, owner, getOwnerOf])
  if (!open) return null

  const hasNFT = isMinted(nodeData)

  const Row: React.FC<{ label: React.ReactNode; value: React.ReactNode; copy?: string }> = ({ label, value, copy }) => (
    <div className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-0.5 items-start text-[12px] leading-[1.15rem]">
      <div className="text-gray-500 dark:text-gray-400 pt-0.5 select-none truncate whitespace-nowrap overflow-hidden text-ellipsis font-medium" title={typeof label === 'string' ? label : undefined}>{label}</div>
      <div className="flex items-start gap-1 min-w-0">
        <div className="font-mono break-all min-w-0 text-[13px] text-gray-800 dark:text-gray-200 leading-snug">{value}</div>
        {copy ? (
          <button aria-label={t('search.copy')} onClick={() => onCopy(copy)} className="shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors -mt-[2px]">
            <Clipboard size={14} />
          </button>
        ) : null}
      </div>
    </div>
  )
  const SmartHash: React.FC<{ text?: string | null }> = ({ text }) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null)
    const measureRef = React.useRef<HTMLSpanElement | null>(null)
    const [useAbbrev, setUseAbbrev] = React.useState<boolean>(() => !isDesktop)
    const fullText = text ?? ''
    React.useEffect(() => {
      if (!text) { setUseAbbrev(false); return }
      if (!isDesktop) { setUseAbbrev(true); return }
      const container = containerRef.current
      const measure = measureRef.current
      if (!container || !measure) return
      const available = container.clientWidth
      const needed = measure.scrollWidth
      setUseAbbrev(needed > available + 1)
    }, [fullText, isDesktop])
    React.useEffect(() => {
      if (!isDesktop) return
      const onResize = () => {
        const container = containerRef.current
        const measure = measureRef.current
        if (!container || !measure) return
        setUseAbbrev(measure.scrollWidth > container.clientWidth + 1)
      }
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }, [isDesktop])
    if (!text) return <span>-</span>
    return (
      <div ref={containerRef} className="relative min-w-0">
        <span className="block whitespace-nowrap break-normal overflow-hidden text-ellipsis">{useAbbrev ? formatHashMiddle(text) : text}</span>
        <span ref={measureRef} className="absolute left-0 top-0 opacity-0 pointer-events-none whitespace-nowrap break-normal">{text}</span>
      </div>
    )
  }

  const SmartAddress: React.FC<{ text?: string | null }> = ({ text }) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null)
    const measureRef = React.useRef<HTMLSpanElement | null>(null)
    const [useAbbrev, setUseAbbrev] = React.useState<boolean>(() => !isDesktop)
    const fullText = text ?? ''
    React.useEffect(() => {
      if (!text) { setUseAbbrev(false); return }
      if (!isDesktop) { setUseAbbrev(true); return }
      const container = containerRef.current
      const measure = measureRef.current
      if (!container || !measure) return
      const available = container.clientWidth
      const needed = measure.scrollWidth
      setUseAbbrev(needed > available + 1)
    }, [fullText, isDesktop])
    React.useEffect(() => {
      if (!isDesktop) return
      const onResize = () => {
        const container = containerRef.current
        const measure = measureRef.current
        if (!container || !measure) return
        setUseAbbrev(measure.scrollWidth > container.clientWidth + 1)
      }
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }, [isDesktop])
    if (!text) return <span>-</span>
    return (
      <div ref={containerRef} className="relative min-w-0">
        <span className="block whitespace-nowrap overflow-hidden text-ellipsis">{useAbbrev ? shortAddress(text) : text}</span>
        <span ref={measureRef} className="absolute left-0 top-0 opacity-0 pointer-events-none whitespace-nowrap">{text}</span>
      </div>
    )
  }
  const onCopy = async (text: string) => {
    const ok = await copyText(text)
    setCenterHint(ok ? t('search.copied') : t('search.copyFailed'))
    window.setTimeout(() => setCenterHint(null), 1200)
  }

  return createPortal(
    <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm overflow-x-hidden" onClick={handleClose} style={{ touchAction: 'pan-y' }}>
      <div className="flex items-end sm:items-center justify-center h-full w-full p-2 sm:p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div
          className={`relative flex flex-col w-full max-w-[680px] ${hasNFT ? 'h-[92vh]' : 'h-auto max-h-[92vh] mb-2'} sm:h-auto sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transform transition-transform duration-300 ease-out ${entered ? 'translate-y-0' : 'translate-y-full sm:translate-y-0'} will-change-transform`}
          style={{ transform: dragging ? `translateY(${dragOffset}px)` : undefined, transitionDuration: dragging ? '0ms' : undefined }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="sticky top-0 bg-gradient-to-br from-blue-500/10 via-purple-500/8 to-indigo-500/10 dark:from-blue-600/20 dark:via-purple-600/15 dark:to-indigo-600/20 px-4 py-4 pt-7 sm:pt-6 sm:px-6 border-b border-gray-200/50 dark:border-gray-700/50 z-10 relative touch-none cursor-grab active:cursor-grabbing backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60"
            onPointerDown={(e) => { (e.currentTarget as any).setPointerCapture?.(e.pointerId); startYRef.current = e.clientY; setDragging(true) }}
            onPointerMove={(e) => { if (!dragging || startYRef.current == null) return; const dy = Math.max(0, e.clientY - startYRef.current); setDragOffset(dy) }}
            onPointerUp={() => { if (!dragging) return; const shouldClose = dragOffset > 120; setDragging(false); setDragOffset(0); if (shouldClose) handleClose() }}
            onPointerCancel={() => { setDragging(false); setDragOffset(0) }}
            onTouchStart={(e) => { startYRef.current = e.touches[0].clientY; setDragging(true) }}
            onTouchMove={(e) => { if (!dragging || startYRef.current == null) return; const dy = Math.max(0, e.touches[0].clientY - startYRef.current); setDragOffset(dy) }}
            onTouchEnd={() => { if (!dragging) return; const shouldClose = dragOffset > 120; setDragging(false); setDragOffset(0); if (shouldClose) handleClose() }}
          >
            {/* Drag handle */}
            <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 h-1.5 w-12 rounded-full bg-gray-300/90 dark:bg-gray-700/90" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-[17px] sm:text-[18px] font-semibold text-gray-900 dark:text-gray-100 truncate pr-2 tracking-tight">
                    {t('familyTree.personVersionDetail.title')}
                  </div>
                </div>
              </div>
              <button 
                aria-label="close" 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors" 
                onClick={(e) => { e.stopPropagation(); handleClose() }}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        {centerHint && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
            <div className="rounded bg-black/80 dark:bg-black/70 text-white px-3 py-1.5 text-xs animate-fade-in">{centerHint}</div>
          </div>
        )}
        <div className="flex-1 min-h-0 px-4 pb-24 pt-2 overflow-y-auto overscroll-contain overflow-x-hidden scroll-smooth space-y-3 text-[12px] text-gray-900 dark:text-gray-100" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 4rem)', touchAction: 'pan-y' }}>
          <div className="space-y-1.5">
            <Row label={t('familyTree.nodeDetail.hash')} value={<SmartHash text={(nodeData?.personHash || fallback.hash)} />} copy={nodeData?.personHash || fallback.hash} />
            <Row label={t('familyTree.nodeDetail.version')} value={(nodeData?.versionIndex !== undefined && Number(nodeData.versionIndex) > 0) ? String(nodeData.versionIndex) : '-'} />
            <Row label={t('familyTree.nodeDetail.endorsementCount')} value={nodeData?.endorsementCount ?? '-'} />
            <Row label={t('familyTree.nodeDetail.father')} value={<SmartHash text={nodeData?.fatherHash} />} copy={nodeData?.fatherHash} />
            <Row label={t('familyTree.nodeDetail.fatherVersion')} value={(nodeData && Number(nodeData.fatherVersionIndex) > 0) ? String(nodeData.fatherVersionIndex) : '-'} />
            <Row label={t('familyTree.nodeDetail.mother')} value={<SmartHash text={nodeData?.motherHash} />} copy={nodeData?.motherHash} />
            <Row label={t('familyTree.nodeDetail.motherVersion')} value={(nodeData && Number(nodeData.motherVersionIndex) > 0) ? String(nodeData.motherVersionIndex) : '-'} />
            <Row label={t('familyTree.nodeDetail.addedBy')} value={shortAddress(nodeData?.addedBy) || '-'} copy={nodeData?.addedBy} />
            <Row label={t('familyTree.nodeDetail.timestamp')} value={formatUnixSeconds(nodeData?.timestamp)} />
            <Row label={t('familyTree.nodeDetail.tag')} value={nodeData?.tag ?? '-'} />
            <Row label={t('familyTree.nodeDetail.cid')} value={nodeData?.metadataCID || '-'} copy={nodeData?.metadataCID ? nodeData.metadataCID : undefined} />
            {(isMinted(nodeData) || nodeData?.fullName || nodeData?.nftTokenURI || nodeData?.story) && (
              <div className="pt-1">
                <div className="my-2 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
                <div className="text-[12px] font-semibold text-gray-600 dark:text-gray-300 tracking-wide mb-1 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-sm bg-gray-400 dark:bg-gray-500" />{t('familyTree.nodeDetail.nft')}
                </div>
              </div>
            )}
            {(isMinted(nodeData) || nodeData?.fullName || nodeData?.nftTokenURI || nodeData?.story) && (
              <>
                <Row label={t('familyTree.nodeDetail.tokenId')} value={isMinted(nodeData) ? nodeData!.tokenId : '-'} copy={isMinted(nodeData) ? nodeData!.tokenId : undefined} />
                {nodeData?.fullName && <Row label={t('familyTree.nodeDetail.fullName')} value={nodeData.fullName} />}
                {nodeData?.gender !== undefined && (
                  <Row label={t('familyTree.nodeDetail.gender')} value={genderTextFn(nodeData.gender, t as any) || '-'} />
                )}
                <Row label={t('familyTree.nodeDetail.birth')} value={(() => {
                  const d = birthDateString(nodeData)
                  const parts = [d, nodeData?.birthPlace].filter(Boolean)
                  return parts.length ? parts.join(' · ') : '-'
                })()} />
                <Row label={t('familyTree.nodeDetail.death')} value={(() => {
                  const d = deathDateString(nodeData)
                  const parts = [d, nodeData?.deathPlace].filter(Boolean)
                  return parts.length ? parts.join(' · ') : '-'
                })()} />
                {nodeData?.story && nodeData.story.trim() !== '' && (
                  <div className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-0.5 items-start text-[12px] leading-[1.15rem]">
                    <div className="text-gray-500 dark:text-gray-400 pt-0.5 select-none truncate">{t('familyTree.nodeDetail.story')}</div>
                    <div className="font-mono text-[11px] text-gray-800 dark:text-gray-200 leading-snug whitespace-pre-wrap break-words min-w-0">{nodeData.story}</div>
                  </div>
                )}
                {isMinted(nodeData) && (
                  <div className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-0.5 items-start text-[12px] leading-[1.15rem]">
                    <div className="text-gray-500 dark:text-gray-400 pt-0.5 select-none truncate">{t('familyTree.nodeDetail.profile')}</div>
                    <div className="space-y-1">
                      <div className="flex gap-3 text-[11px] flex-wrap pt-0.5">
                        <button
                          onClick={() => {
                            const url = `/person/${nodeData?.tokenId}`
                            window.open(url, '_blank')
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline flex items-center gap-1"
                        >
                          <ChevronRight size={11} />
                          {t('familyTree.nodeDetail.viewFullStory')}
                        </button>
                        <button
                          onClick={() => {
                            if (!nodeData?.tokenId) return
                            navigate(`/editor/${nodeData.tokenId}`)
                          }}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline flex items-center gap-1"
                        >
                          <Edit2 size={11} />
                          {t('familyTree.nodeDetail.editStory')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {isMinted(nodeData) && (
                  <Row label={t('person.owner', 'Owner Address')} value={<SmartAddress text={owner} />} copy={owner} />
                )}
                {nodeData?.nftTokenURI && <Row label={t('familyTree.nodeDetail.uri')} value={nodeData.nftTokenURI} copy={nodeData.nftTokenURI} />}
              </>
            )}
          </div>
          {/* Bottom spacer to ensure last row (e.g., URI) is visible above rounded edge / safe area */}
          <div className="h-3 sm:h-1" />
          {loading && (
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">{t('familyTree.nodeDetail.loading')}</div>
          )}
          {error && (
            <div className="text-center text-xs text-red-500 dark:text-red-400 py-2">{error}</div>
          )}
        </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
