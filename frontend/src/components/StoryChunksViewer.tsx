import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  X,
  User,
  Calendar,
  Book,
  FileText,
  Clock,
  ChevronDown,
  ChevronRight,
  Copy,
  Layers,
  Hash,
  Check,
  AlertCircle,
  Wallet,
  Link,
  Edit2
} from 'lucide-react'
import { NodeData, StoryChunk } from '../types/graph'
import { useTreeData } from '../context/TreeDataContext'
import { useConfig } from '../context/ConfigContext'
import { ethers } from 'ethers'
import DeepFamily from '../abi/DeepFamily.json'

interface StoryChunksViewerProps {
  person: NodeData
  isOpen: boolean
  onClose: () => void
}

interface StoryData {
  chunks: StoryChunk[]
  fullStory: string
  integrity: {
    missing: number[]
    lengthMatch: boolean
    hashMatch: boolean | null
    computedLength: number
    computedHash?: string
  }
  loading: boolean
  integrityChecking: boolean
  error?: string
}

// Removed computeStoryIntegrity function as it's now handled in TreeDataContext

export default function StoryChunksViewer({ person, isOpen, onClose }: StoryChunksViewerProps) {
  const { t } = useTranslation()
  const { getStoryData } = useTreeData()
  const { rpcUrl, contractAddress } = useConfig()
  const nameContainerRef = useRef<HTMLDivElement | null>(null)
  const nameTextRef = useRef<HTMLSpanElement | null>(null)
  const [marquee, setMarquee] = useState(false)
  const navigate = useNavigate()

  const [storyData, setStoryData] = useState<StoryData>({
    chunks: [],
    fullStory: '',
    integrity: { missing: [], lengthMatch: true, hashMatch: null, computedLength: 0 },
    loading: false,
    integrityChecking: false
  })
  
  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<'chunks' | 'full'>('chunks')
  const [centerHint, setCenterHint] = useState<string | null>(null)
  const [entered, setEntered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startYRef = useRef<number | null>(null)
  const [owner, setOwner] = useState<string | undefined>(undefined)

  // Computed meta for compact row under Detailed Story
  const chunksCount = useMemo(() => (
    person.storyMetadata?.totalChunks ?? storyData.chunks.length
  ), [person.storyMetadata, storyData.chunks])
  const lengthBytes = useMemo(() => (
    person.storyMetadata?.totalLength ?? (storyData.integrity.computedLength || storyData.fullStory.length)
  ), [person.storyMetadata, storyData.integrity.computedLength, storyData.fullStory.length])
  const integrityOk = useMemo(() => (
    !!storyData.integrity && storyData.integrity.missing.length === 0 && storyData.integrity.lengthMatch && storyData.integrity.hashMatch === true
  ), [storyData.integrity])

  // Format dates
  const formatDate = useMemo(() => {
    const formatDatePart = (year?: number, month?: number, day?: number, isBC?: boolean) => {
      if (!year) return ''
      let dateStr = isBC ? `BC ${year}` : year.toString()
      if (month && month > 0) {
        dateStr += `-${month.toString().padStart(2, '0')}`
        if (day && day > 0) {
          dateStr += `-${day.toString().padStart(2, '0')}`
        }
      }
      return dateStr
    }

    const birth = formatDatePart(person.birthYear, person.birthMonth, person.birthDay, person.isBirthBC)
    const death = formatDatePart(person.deathYear, person.deathMonth, person.deathDay, person.isDeathBC)
    
    return { birth, death }
  }, [person])

  // Gender text
  const genderText = useMemo(() => {
    switch (person.gender) {
      case 1: return t('visualization.nodeDetail.genders.male', 'Male')
      case 2: return t('visualization.nodeDetail.genders.female', 'Female')
      case 3: return t('visualization.nodeDetail.genders.other', 'Other')
      default: return ''
    }
  }, [person.gender, t])

  // Copy function
  const copyText = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text)
        setCenterHint(t('common.copied', 'Copied'))
        setTimeout(() => setCenterHint(null), 1200)
        return true
      }
    } catch {}
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      // Using deprecated execCommand as fallback for older browsers
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      setCenterHint(ok ? t('common.copied', 'Copied') : t('common.copyFailed', 'Failed to copy'))
      setTimeout(() => setCenterHint(null), 1200)
      return ok
    } catch {
      setCenterHint(t('common.copyFailed', 'Failed to copy'))
      setTimeout(() => setCenterHint(null), 1200)
      return false
    }
  }, [t])

  // Fetch story data using TreeDataContext
  const fetchStoryData = useCallback(async () => {
    if (!person.tokenId) {
      return
    }

    setStoryData(prev => ({ ...prev, loading: true, integrityChecking: false, error: undefined }))

    try {
      const data = await getStoryData(person.tokenId)
      
      // If there are chunks, show integrity checking status first
      if (data.chunks.length > 0) {
        setStoryData(prev => ({
          ...prev,
          chunks: data.chunks,
          fullStory: data.fullStory,
          loading: false,
          integrityChecking: true
        }))
        
        // Small delay to show "checking..." status
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      setStoryData({
        chunks: data.chunks,
        fullStory: data.fullStory,
        integrity: data.integrity,
        loading: false,
        integrityChecking: false
      })
    } catch (err: any) {
      console.error('Failed to fetch story chunks:', err)
      setStoryData(prev => ({
        ...prev,
        loading: false,
        integrityChecking: false,
        error: err.message || t('storyChunksViewer.fetchError', 'Failed to load story data')
      }))
    }
  }, [person.tokenId, getStoryData, t])

  // Load data when opened
  useEffect(() => {
    if (isOpen) {
      fetchStoryData()
    }
  }, [isOpen, fetchStoryData])

  // Fetch owner address for token when modal opens
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!isOpen) return
        if (!person.tokenId || person.tokenId === '0') return
        if (!rpcUrl || !contractAddress) return
        const provider = new ethers.JsonRpcProvider(rpcUrl)
        const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, provider)
        const addr = await contract.ownerOf(person.tokenId)
        if (!cancelled) setOwner(addr)
      } catch {
        if (!cancelled) setOwner(undefined)
      }
    })()
    return () => { cancelled = true }
  }, [isOpen, person.tokenId, rpcUrl, contractAddress])

  // Toggle chunk expansion
  const toggleChunk = (index: number) => {
    setExpandedChunks(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // Remove unused handlePreload function - preloading is handled in PersonStoryCard

  // Determine if name overflows to enable marquee
  useEffect(() => {
    if (!isOpen) return
    const check = () => {
      if (nameContainerRef.current && nameTextRef.current) {
        const need = nameTextRef.current.scrollWidth > nameContainerRef.current.clientWidth + 4
        setMarquee(need)
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [isOpen, person.fullName])

  // Prevent background scroll when open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  if (!isOpen) return null

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Enter animation for mobile bottom sheet
  useEffect(() => { if (isOpen) { requestAnimationFrame(() => setEntered(true)) } else { setEntered(false) } }, [isOpen])

  return createPortal(
    <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm" onClick={onClose}>
      {/* Modal Container (responsive: bottom sheet on mobile, dialog on desktop) */}
      <div className="flex items-end sm:items-center justify-center h-full w-full p-3 sm:p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div
          className={`relative flex flex-col w-full max-w-[860px] h-[92vh] sm:h-auto sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transform transition-transform duration-300 ease-out ${entered ? 'translate-y-0' : 'translate-y-full sm:translate-y-0'} select-none will-change-transform`}
          onClick={(e) => e.stopPropagation()}
          style={{ transform: dragging ? `translateY(${dragOffset}px)` : undefined, transitionDuration: dragging ? '0ms' : undefined }}
        >
          {/* Center Hint */}
          {centerHint && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
              <div className="rounded-lg bg-black/80 dark:bg-black/70 text-white px-4 py-2 text-xs font-medium animate-fade-in shadow-lg">
                {centerHint}
              </div>
            </div>
          )}
          {/* Header (sticky for mobile) */}
          <div
            className="sticky top-0 bg-gradient-to-br from-blue-500/10 via-purple-500/8 to-indigo-500/10 dark:from-blue-600/20 dark:via-purple-600/15 dark:to-indigo-600/20 p-4 pt-7 sm:pt-6 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 relative touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => { (e.currentTarget as any).setPointerCapture?.(e.pointerId); startYRef.current = e.clientY; setDragging(true) }}
            onPointerMove={(e) => { if (!dragging || startYRef.current == null) return; const dy = Math.max(0, e.clientY - startYRef.current); setDragOffset(dy) }}
            onPointerUp={() => { if (!dragging) return; const shouldClose = dragOffset > 120; setDragging(false); setDragOffset(0); if (shouldClose) onClose() }}
            onPointerCancel={() => { setDragging(false); setDragOffset(0) }}
            onTouchStart={(e) => { startYRef.current = e.touches[0].clientY; setDragging(true) }}
            onTouchMove={(e) => { if (!dragging || startYRef.current == null) return; const dy = Math.max(0, e.touches[0].clientY - startYRef.current); setDragOffset(dy) }}
            onTouchEnd={() => { if (!dragging) return; const shouldClose = dragOffset > 120; setDragging(false); setDragOffset(0); if (shouldClose) onClose() }}
          >
            {/* Drag handle (overlayed) */}
            <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 h-1.5 w-12 rounded-full bg-gray-300/90 dark:bg-gray-700/90" />
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="min-w-0">
                  {/* Name with conditional marquee when overflow */}
                  <div ref={nameContainerRef} className="relative max-w-[56vw] sm:max-w-xs md:max-w-md overflow-hidden">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 whitespace-nowrap">
                      <span
                        ref={nameTextRef}
                        className={`inline-block pr-8 ${marquee ? 'will-change-transform animate-[marquee_12s_linear_infinite]' : ''}`}
                      >
                        {person.fullName || `Person ${person.personHash.slice(0, 8)}...`}
                      </span>
                    </h2>
                    {marquee && (
                      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white dark:from-gray-900 to-transparent" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                    {genderText && <span className="whitespace-nowrap">{genderText}</span>}
                    {person.tokenId && person.tokenId !== '0' && (
                      <div className="flex items-center gap-2">
                        <span className="font-mono whitespace-nowrap">#{person.tokenId}</span>
                        {person.endorsementCount !== undefined && person.endorsementCount > 0 && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full whitespace-nowrap">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-[9px] sm:text-[10px] font-medium text-yellow-700 dark:text-yellow-300">
                              {person.endorsementCount}
                            </span>
                          </div>
                        )}
                        {/* Moved People Encyclopedia button here after endorsement info */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`/person/${person.tokenId || person.id}`, '_blank', 'noopener,noreferrer')
                          }}
                          onPointerDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-medium rounded-full transition-colors whitespace-nowrap flex-shrink-0"
                        >
                          <Book className="w-3.5 h-3.5" />
                          {t('storyChunksViewer.peopleEncyclopedia', '人物百科')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Removed encyclopedia button from here; now only close */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onClose()
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  aria-label={t('common.close', 'Close')}
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-4 sm:p-6 pb-24 sm:pb-6">{/* extra bottom space for safe touch area */}
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50/70 dark:bg-gray-800/30 rounded-2xl">
                {(formatDate.birth || person.birthPlace) && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {t('storyChunksViewer.born', 'Born')}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                        {[formatDate.birth, person.birthPlace].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                )}

                {(formatDate.death || person.deathPlace) && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {t('storyChunksViewer.died', 'Died')}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                        {[formatDate.death, person.deathPlace].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Top-level Story Info (restored) */}
                {(person.storyMetadata || storyData.chunks.length > 0 || storyData.integrity.computedLength > 0 || storyData.fullStory) && (
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {t('storyChunksViewer.storyInfo', 'Biography')}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {t('storyChunksViewer.chunksCount', '{{count}} chunks, {{length}} bytes', {
                          count: chunksCount,
                          length: lengthBytes
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {person.tag && (
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {t('storyChunksViewer.tag', 'Tag')}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-600 dark:text-gray-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                          {person.tag}
                        </div>
                        <button
                          onClick={() => copyText(person.tag!)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {person.nftTokenURI && (
                  <div className="flex items-center gap-3">
                    <Link className="w-5 h-5 text-blue-500" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {t('visualization.nodeDetail.uri', 'URI')}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 font-mono break-all">
                          {person.nftTokenURI}
                        </div>
                        <button
                          onClick={() => copyText(person.nftTokenURI!)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {person.personHash && (
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-purple-500" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {t('storyChunksViewer.personHash', 'Person Hash')}
                        {person.versionIndex && (
                          <span className="ml-2 text-[10px] font-mono text-gray-500 dark:text-gray-400">
                            v{person.versionIndex}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 font-mono break-all">
                          {person.personHash}
                        </div>
                        <button
                          onClick={() => copyText(person.personHash)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {(person.tokenId && person.tokenId !== '0') && (
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-indigo-500" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {t('person.owner', 'Owner Address')}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 font-mono break-all">
                          {owner || '-'}
                        </div>
                        {owner && (
                          <button
                            onClick={() => copyText(owner)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Story Content */}
              <div>
                {/* Basic Story must reflect person.story exactly */}
                {person.story && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      {t('storyChunksViewer.basicStory', 'Basic Story')}
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {person.story}
                      </p>
                    </div>
                  </div>
                )}
                {(person.hasDetailedStory || person.storyMetadata || storyData.loading || storyData.chunks.length > 0 || !!storyData.fullStory || storyData.integrity.computedLength > 0 || (person.tokenId && person.tokenId !== '0')) && (
                  <>
                  {/* View Mode Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Book className="w-5 h-5 text-blue-600" />
                      {t('storyChunksViewer.detailedStory', 'Detailed Story')}
                    </h3>
                    
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                      <button
                        onClick={() => setViewMode('chunks')}
                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          viewMode === 'chunks'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                        }`}
                      >
                        <Layers className="w-4 h-4 inline mr-1" />
                        {t('storyChunksViewer.chunks', 'Chunks')}
                      </button>
                      <button
                        onClick={() => setViewMode('full')}
                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          viewMode === 'full'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                        }`}
                      >
                        <FileText className="w-4 h-4 inline mr-1" />
                        {t('storyChunksViewer.fullText', 'Full Text')}
                      </button>
                    </div>
                  </div>

                  {/* Status + Integrity on same row; chunks meta below — always show, even if empty */}
                  <>
                    <div className="flex items-center justify-between -mt-2 mb-1 text-[10px] text-gray-600 dark:text-gray-400">
                      <div>
                        {person.storyMetadata?.isSealed ? (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-blue-500/70 dark:border-blue-400/60 text-blue-600 dark:text-blue-300 text-[10px] sm:text-xs font-medium bg-transparent">
                            {t('person.sealed', 'Sealed')}
                          </span>
                        ) : (
                          person.tokenId ? (
                            <button
                              onClick={() => {
                                if (!person.tokenId) return
                                // Navigate to full-screen editor page with prefetched data
                                const prefetched = {
                                  tokenId: person.tokenId,
                                  storyMetadata: person.storyMetadata,
                                  storyChunks: storyData.chunks,
                                }
                                navigate(`/editor/${person.tokenId}`, { state: { prefetchedStory: prefetched } })
                              }}
                              className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-xs font-medium transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" />
                              {t('person.editable', 'Editable')}
                            </button>
                          ) : null
                        )}
                      </div>
                      {chunksCount > 0 && !storyData.loading && (
                        storyData.integrityChecking ? (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-blue-500/70 dark:border-blue-400/60 text-blue-600 dark:text-blue-300 text-[10px] sm:text-xs font-medium bg-transparent">
                            <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full mr-2"></div>
                            {t('storyChunksViewer.integrityChecking', '正在检查完整性...')}
                          </span>
                        ) : storyData.integrity && (
                          integrityOk ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-green-500/70 dark:border-green-400/60 text-green-600 dark:text-green-300 text-[10px] sm:text-xs font-medium bg-transparent">
                              {t('storyChunksViewer.integrityVerified', '完整性验证通过')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-amber-500/70 dark:border-amber-400/60 text-amber-600 dark:text-amber-300 text-[10px] sm:text-xs font-medium bg-transparent">
                              {t('storyChunksViewer.integrityWarning', '完整性验证失败')}
                            </span>
                          )
                        )
                      )}
                    </div>
                    <div className="mb-2 text-[10px] text-gray-600 dark:text-gray-400">
                      {t('storyChunksViewer.chunksCount', '{{count}} chunks, {{length}} bytes', {
                        count: chunksCount,
                        length: lengthBytes
                      })}
                    </div>
                  </>

                  {storyData.loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                        {t('storyChunksViewer.loading', 'Loading story chunks...')}
                      </span>
                    </div>
                  ) : storyData.error ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                      <p className="text-sm text-red-600 dark:text-red-400">{storyData.error}</p>
                    </div>
                  ) : viewMode === 'chunks' && storyData.chunks.length > 0 ? (
                    <div className="space-y-3">
                      {storyData.chunks.map((chunk) => {
                        const isExpanded = expandedChunks.has(chunk.chunkIndex)
                        const preview = chunk.content.length > 150 ? `${chunk.content.slice(0, 150)}...` : chunk.content
                        
                        return (
                          <div key={chunk.chunkIndex} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                            <button
                              onClick={() => toggleChunk(chunk.chunkIndex)}
                              className="w-full text-left flex items-start gap-3"
                            >
                              <span className="mt-1 text-gray-400">
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </span>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {t('storyChunksViewer.chunkTitle', 'Chunk #{{index}}', { index: chunk.chunkIndex })}
                                  </span>
                                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {chunk.content.length} {t('storyChunksViewer.characters', 'characters')}
                                  </span>
                                </div>
                                
                                <div className={`text-xs text-gray-700 dark:text-gray-300 ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-3'}`}>
                                  {isExpanded ? chunk.content : preview}
                                </div>
                                
                                <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(chunk.timestamp * 1000).toLocaleString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {chunk.lastEditor.slice(0, 8)}...
                                  </span>
                                </div>
                              </div>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : viewMode === 'full' && storyData.fullStory ? (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-xs leading-relaxed text-gray-800 dark:text-gray-200">
                          {storyData.fullStory}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('storyChunksViewer.noStoryData', 'No story data available')}
                      </p>
                    </div>
                  )}
                  </>
                )}
                {/* Empty state only if no basic or detailed content */}
                {!person.story && !(person.hasDetailedStory || person.storyMetadata || storyData.chunks.length > 0 || !!storyData.fullStory || storyData.integrity.computedLength > 0 || storyData.loading) && (
                  <div className="text-center py-12">
                    <Book className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('storyChunksViewer.noStory', 'No story content available')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
