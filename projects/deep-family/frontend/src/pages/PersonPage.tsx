import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Edit2, Clock, User, ChevronDown, ChevronRight, FileText, List, Copy, GitBranch, Clipboard } from 'lucide-react'
import { StoryChunk, StoryMetadata, genderText as genderTextFn, formatYMD, formatUnixSeconds, shortAddress, formatHashMiddle } from '../types/graph'
import { useConfig } from '../context/ConfigContext'
import { useTreeData } from '../context/TreeDataContext'
import { useToast } from '../components/ToastProvider'
import { ethers } from 'ethers'

function computeStoryIntegrity(chunks: StoryChunk[], metadata: StoryMetadata){
  const sorted = [...chunks].sort((a,b)=>a.chunkIndex-b.chunkIndex);
  const missing: number[] = [];
  for (let i=0;i<metadata.totalChunks;i++){ if(!sorted.find(c=>c.chunkIndex===i)) missing.push(i); }
  const fullStory = sorted.map(c=>c.content).join('');
  const encoder = new TextEncoder();
  const computedLength = sorted.reduce((acc,c)=> acc + encoder.encode(c.content).length, 0);
  const lengthMatch = computedLength === metadata.totalLength;
  let hashMatch: boolean | null = null; let computedHash: string | undefined;
  if (missing.length===0 && metadata.totalChunks>0 && metadata.fullStoryHash && metadata.fullStoryHash !== ethers.ZeroHash){
    try {
      // Contract logic: concatenation of all chunkHash (bytes32) values then keccak256
      const concatenated = '0x' + sorted.map(c => c.chunkHash.replace(/^0x/, '')).join('');
      computedHash = ethers.keccak256(concatenated);
      hashMatch = computedHash === metadata.fullStoryHash;
    } catch { /* ignore */ }
  }
  return { fullStory, integrity: { missing, lengthMatch, hashMatch, computedLength, computedHash } };
}

interface StoryDetailData {
  tokenId: string
  personHash?: string
  versionIndex?: number
  fullName?: string
  storyMetadata?: StoryMetadata
  storyChunks?: StoryChunk[]
  fullStory?: string
  owner?: string
  nftCoreInfo?: {
    gender?: number
    birthYear?: number
    birthMonth?: number
    birthDay?: number
    birthPlace?: string
    isBirthBC?: boolean
    deathYear?: number
    deathMonth?: number
    deathDay?: number
    deathPlace?: string
    isDeathBC?: boolean
    story?: string
  }
  integrity?: {
    missing: number[]
    lengthMatch: boolean
    hashMatch: boolean | null
    computedLength: number
    computedHash?: string
  }
}

export default function PersonPage() {
  const { tokenId } = useParams<{ tokenId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  // Config used in child components (HashAndIndexLine) via useConfig
  const { getStoryData, getNodeByTokenId, getOwnerOf, nodesData } = useTreeData()
  const { strictCacheOnly } = useConfig()
  const toast = useToast()
  
  const [data, setData] = useState<StoryDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<'paragraph' | 'raw'>('paragraph')
  const prefetched = (location.state as any)?.prefetchedStory as Partial<StoryDetailData> | undefined

  // Dynamic title: person name + archive
  useEffect(()=>{
    if (data?.fullName) {
      document.title = `DeepFamily - ${t('person.pageTitle', { name: data.fullName })}`
    }
  }, [data?.fullName, t])

  const formatDate = (ts?: number) => formatUnixSeconds(ts)

  const fullStoryParagraphs = useMemo(() => {
    if (!data?.fullStory) return []
    if (viewMode === 'raw') return []
    const raw = data.fullStory.replace(/\r\n/g, '\n').trim()
    let parts = raw.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
    if (parts.length <= 1) {
      const sentencePieces = raw
        .split(/(?<=[。．\.?!！？])\s+(?=\S)/)
        .map(s => s.trim())
        .filter(Boolean)
      if (sentencePieces.length > 1) {
        const grouped: string[] = []
        let buffer = ''
        for (const s of sentencePieces) {
          if (buffer && (buffer + ' ' + s).length > 240) {
            grouped.push(buffer.trim())
            buffer = s
          } else {
            buffer = buffer ? buffer + ' ' + s : s
          }
        }
        if (buffer) grouped.push(buffer.trim())
        parts = grouped
      }
    }
    if (parts.length <= 1) {
      const lineSplit = raw.split(/\n/).map(l => l.trim()).filter(Boolean)
      if (lineSplit.length > 1 && lineSplit.length < 50) {
        parts = lineSplit
      }
    }
    return parts
  }, [data?.fullStory, viewMode])

  const chunkParagraphs = useMemo(() => {
    if (!data?.storyChunks || data.storyChunks.length === 0) return []
    return [...data.storyChunks]
      .sort((a, b) => a.chunkIndex - b.chunkIndex)
      .map(c => c.content)
  }, [data?.storyChunks])

  const toggleChunk = (idx: number) => {
    setExpandedChunks(prev => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  // When ?edit=1 is present, navigate to editor in the same tab with prefetched data,
  // and clean the current URL first to avoid redirect loop on back navigation.
  useEffect(() => {
    const qs = new URLSearchParams(location.search)
    const wantEdit = qs.get('edit') === '1'
    if (wantEdit && tokenId) {
      // 1) Clean current URL (remove edit=1) in-place
      const params = new URLSearchParams(location.search)
      params.delete('edit')
      const nextSearch = params.toString()
      navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`, { replace: true })
      // 2) Push editor route with optional prefetched data
      const state: any = {}
      if (data?.storyMetadata || data?.storyChunks) {
        state.prefetchedStory = { tokenId, storyMetadata: data?.storyMetadata, storyChunks: data?.storyChunks }
      }
      navigate(`/editor/${tokenId}`, { state })
    }
  }, [location.search, tokenId, data, navigate])

  // If we navigated here with prefetched story data (from StoryChunksModal), hydrate immediately
  useEffect(() => {
    if (!tokenId) return
    if (!prefetched) return
    if (prefetched.tokenId && String(prefetched.tokenId) !== String(tokenId)) return
    // Only hydrate once if no existing data
    setData(prev => prev || ({
      tokenId,
      fullName: prefetched.fullName,
      storyMetadata: prefetched.storyMetadata,
      storyChunks: prefetched.storyChunks,
      fullStory: prefetched.storyChunks ? prefetched.storyChunks.map(c => c.content).join('') : undefined,
    } as StoryDetailData))
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefetched?.tokenId])

  // Inline editor removed; navigation handles edit flow

  const fetchStoryData = useCallback(async () => {
    if (!tokenId) {
      setError(t('person.invalidTokenId', 'Invalid token ID'))
      setLoading(false)
      return
    }
    // Simple format validation: only allow non-negative integers
    if (!/^\d+$/.test(tokenId)) {
      setError(t('person.invalidTokenId', 'Invalid token ID'))
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      // 1) First try to hit in memory nodesData (no network required)
      let node: any | null = null
      for (const nd of Object.values(nodesData || {})) {
        if (nd?.tokenId && String(nd.tokenId) === String(tokenId)) { node = nd; break }
      }

      // 2) If no node found in memory, use getNodeByTokenId (internally checks local cache first, then decides whether to access network)
      if (!node) {
        node = await getNodeByTokenId(tokenId)
      }

      // 3) Story data: if node already has storyMetadata + storyChunks and not expired, use directly; otherwise call getStoryData
      let story: any | null = null
      if (node?.storyMetadata && Array.isArray(node?.storyChunks)) {
        const fetchedAt = Number(node.storyFetchedAt || 0)
        const isSealed = Boolean(node.storyMetadata?.isSealed)
        const ttl = isSealed ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 1000
        const expired = !fetchedAt || (Date.now() - fetchedAt > ttl)
        if (!expired || strictCacheOnly) {
          const { fullStory, integrity } = computeStoryIntegrity(node.storyChunks, node.storyMetadata)
          story = { metadata: node.storyMetadata, chunks: node.storyChunks, fullStory, integrity }
        }
      }
      if (!story) {
        story = await getStoryData(tokenId)
      }

      // 4) Owner: prefer cache, query chain if not available
      let ownerAddr: string | undefined = node?.owner
      if (!ownerAddr) ownerAddr = (await getOwnerOf(tokenId)) || undefined

      const nftCoreInfo = node ? {
        gender: node.gender,
        birthYear: node.birthYear,
        birthMonth: node.birthMonth,
        birthDay: node.birthDay,
        birthPlace: node.birthPlace,
        isBirthBC: node.isBirthBC,
        deathYear: node.deathYear,
        deathMonth: node.deathMonth,
        deathDay: node.deathDay,
        deathPlace: node.deathPlace,
        isDeathBC: node.isDeathBC,
        story: node.story || ''
      } : undefined

      setData({
        tokenId,
        personHash: node?.personHash,
        versionIndex: node?.versionIndex,
        fullName: node?.fullName,
        nftCoreInfo,
        storyMetadata: story?.metadata as StoryMetadata,
        storyChunks: story?.chunks as StoryChunk[],
        fullStory: story?.fullStory,
        owner: ownerAddr,
        integrity: story?.integrity as any
      })
    } catch (err: any) {
      // Parse error message
      const raw = err?.message || err?.shortMessage || ''
      const full = (typeof err === 'object') ? JSON.stringify(err) : ''
      const lower = (raw + full).toLowerCase()
      let friendly: string | null = null
      if (lower.includes('invalidtokenid') || lower.includes('invalid token id')) {
        friendly = t('person.invalidTokenId', 'Invalid token ID')
      } else if (lower.includes('nonexistent token') || lower.includes('query for nonexistent token') || lower.includes('token does not exist')) {
        friendly = t('person.nonexistentToken', 'Token does not exist')
      } else if (lower.includes('execution reverted')) {
        // Generic revert type
        friendly = t('person.fetchFailed', 'Failed to load token')
      }
      setError(friendly || raw || 'Failed to fetch story data')
    } finally {
      setLoading(false)
    }
  }, [tokenId, t, nodesData, strictCacheOnly])

  useEffect(() => {
    // Skip initial fetch if we already hydrated from prefetched state
    if (prefetched && prefetched.tokenId && String(prefetched.tokenId) === String(tokenId)) return
    fetchStoryData()
  }, [fetchStoryData, prefetched, tokenId])

  const copyText = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text)
        toast.show(t('search.copied'))
        return
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
      toast.show(ok ? t('search.copied') : t('search.copyFailed'))
    } catch {
      toast.show(t('search.copyFailed'))
    }
  }, [t, toast])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-pulse w-full max-w-4xl px-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  // Removed full-page error return; show inline alert instead
  // if (error || !data) { ... }

  return (
    <div>

      {/* Inline error alert (content area) */}
      {error && (
        <div className="pb-4">
          <div
            role="alert"
            className="mb-6 flex flex-col sm:flex-row sm:items-start gap-4 rounded-xl border border-red-300 dark:border-red-700/50 bg-red-50/80 dark:bg-red-900/30 p-5 shadow-sm"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                {t('person.fetchFailed', 'Failed to load token')}
              </p>
              <p className="text-sm text-red-600 dark:text-red-200 break-words">{error}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => fetchStoryData()}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 hover:bg-red-700 text-white shadow-sm"
              >
                {t('common.retry', 'Retry')}
              </button>
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1)
                  } else {
                    navigate('/')
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/40 bg-white dark:bg-transparent"
              >
                {t('common.goBack', 'Go Back')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content only if data present and no error */}
      {!error && data && (
        <>
          {/* Title / Meta Row */}
          <div className="pb-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 flex flex-wrap items-center gap-x-2 gap-y-1 leading-tight">
                  <span className="truncate max-w-[calc(100vw-120px)] sm:max-w-[calc(60vw-80px)] md:max-w-sm text-2xl sm:text-2xl md:text-3xl leading-none" title={data.fullName || `Token #${data.tokenId}`}>{data.fullName || `Token #${data.tokenId}`}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold whitespace-nowrap text-2xl sm:text-2xl md:text-3xl leading-none">{t('person.title', "'s Biography")}</span>
                  {data.storyMetadata && data.storyMetadata.totalChunks > 0 && data.integrity && (() => {
                    const integ = data.integrity
                    const localOk = integ.missing.length === 0 && integ.lengthMatch && (integ.hashMatch === true)
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] sm:text-[10px] leading-tight font-medium ${localOk ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300' : 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-600 dark:text-amber-300'}`}>
                        {localOk ? t('person.integrityFrontendOk','Integrity Frontend Verified') : t('person.integrityWarn','Integrity Possibly Inconsistent')}
                      </span>
                    )
                  })()}
                </h1>
                {data.personHash ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <HashAndIndexLine
                      personHash={data.personHash}
                      versionIndex={data.versionIndex}
                      t={t}
                    />
                  </div>
                ) : null}
                {data.integrity && data.storyMetadata && data.storyMetadata.totalChunks > 0 && (
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500 dark:text-gray-500/70 font-mono">
                    {data.integrity.missing.length>0 && <span>{t('person.integrityMissing', 'Missing indices: {{indices}}', { indices: data.integrity.missing.join(',') })}</span>}
                    {!data.integrity.lengthMatch && <span>{t('person.integrityLenDiff', 'Length mismatch local={{local}} bytes', { local: data.integrity.computedLength })}</span>}
                    {data.integrity.hashMatch === false && <span>{t('person.integrityLocalHashMismatch', 'Local hash mismatch')}</span>}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 md:pt-1">
                {data?.storyMetadata?.isSealed ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-blue-500/70 dark:border-blue-400/60 text-blue-600 dark:text-blue-300 text-[10px] sm:text-xs font-medium bg-transparent">
                    {t('person.sealed', 'Sealed')}
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      if (!tokenId) return
                      // Navigate to full-screen editor page with optional prefetched data
                      // Same-tab navigation to editor with optional prefetched data
                      const state: any = (data?.storyMetadata || data?.storyChunks)
                        ? { prefetchedStory: { tokenId, storyMetadata: data?.storyMetadata, storyChunks: data?.storyChunks } }
                        : {}
                      navigate(`/editor/${tokenId}`, { state })
                    }}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium transition-colors"
                    aria-label={t('person.edit', 'Edit Biography') as string}
                    title={t('person.edit', 'Edit Biography') as string}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    {t('person.editable', 'Editable')}
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* Existing body content below */}
          <div className="py-4">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
              <div className="xl:col-span-3 space-y-6">
                <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl shadow-gray-500/5 dark:shadow-gray-900/20 border border-gray-200/70 dark:border-gray-700/50 p-6 card-surface backdrop-blur-xl relative overflow-hidden group hover:shadow-3xl hover:shadow-gray-500/10 dark:hover:shadow-gray-900/30 transition-all duration-300">
                  {/* Subtle background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/5 pointer-events-none"></div>
                  
                  {data && (data.fullName || data.nftCoreInfo) && (
                    <div className="relative mb-8 pb-8 border-b border-gray-100/80 dark:border-gray-700/40">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8 tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        {t('person.basicInfo','Basic Info')}
                      </h3>
                      <div className="space-y-5 font-mono text-gray-700 dark:text-gray-200 text-xs leading-relaxed tracking-wide selection:bg-indigo-100/70 dark:selection:bg-indigo-800/30">
                        {data.fullName && (
                          <div className="flex items-start gap-2 sm:gap-4 p-3 rounded-xl bg-gradient-to-r from-blue-50/50 to-cyan-50/30 dark:from-blue-900/20 dark:to-cyan-900/10 border border-blue-200/30 dark:border-blue-700/30">
                            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold w-16 sm:w-20 whitespace-nowrap flex-shrink-0">{t('familyTree.nodeDetail.fullName', 'Full Name')}</span>
                            <span className="text-gray-900 dark:text-gray-100 font-semibold text-left">{data.fullName}</span>
                          </div>
                        )}

                        {data.nftCoreInfo?.gender !== undefined && data.nftCoreInfo.gender > 0 && (
                          <div className="flex items-start gap-2 sm:gap-4 p-3 rounded-xl bg-gradient-to-r from-purple-50/50 to-pink-50/30 dark:from-purple-900/20 dark:to-pink-900/10 border border-purple-200/30 dark:border-purple-700/30">
                            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold w-16 sm:w-20 flex-shrink-0">{t('familyTree.nodeDetail.gender', 'Gender')}</span>
                            <span className="text-gray-900 dark:text-gray-100 font-semibold text-left">{genderTextFn(data.nftCoreInfo.gender, t as any) || '-'}</span>
                          </div>
                        )}

                        {data.nftCoreInfo && (data.nftCoreInfo.birthYear || data.nftCoreInfo.birthPlace) && (
                          <div className="flex items-start gap-2 sm:gap-4 p-3 rounded-xl bg-gradient-to-r from-green-50/50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200/30 dark:border-green-700/30">
                            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold w-16 sm:w-20 flex-shrink-0">{t('familyTree.nodeDetail.birth', 'Birth')}</span>
                            <span className="text-gray-900 dark:text-gray-100 font-semibold text-left">
                              {(() => {
                                const d = formatYMD(data.nftCoreInfo!.birthYear, data.nftCoreInfo!.birthMonth, data.nftCoreInfo!.birthDay, data.nftCoreInfo!.isBirthBC)
                                const parts = [d, data.nftCoreInfo!.birthPlace].filter(Boolean)
                                return parts.join(' · ')
                              })()}
                            </span>
                          </div>
                        )}

                        {data.nftCoreInfo && (data.nftCoreInfo.deathYear || data.nftCoreInfo.deathPlace) && (
                          <div className="flex items-start gap-2 sm:gap-4 p-3 rounded-xl bg-gradient-to-r from-gray-50/50 to-slate-50/30 dark:from-gray-900/20 dark:to-slate-900/10 border border-gray-200/30 dark:border-gray-700/30">
                            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold w-16 sm:w-20 flex-shrink-0">{t('familyTree.nodeDetail.death', 'Death')}</span>
                            <span className="text-gray-900 dark:text-gray-100 font-semibold text-left">
                              {(() => {
                                const d = formatYMD(data.nftCoreInfo!.deathYear, data.nftCoreInfo!.deathMonth, data.nftCoreInfo!.deathDay, data.nftCoreInfo!.isDeathBC)
                                const parts = [d, data.nftCoreInfo!.deathPlace].filter(Boolean)
                                return parts.join(' · ')
                              })()}
                            </span>
                          </div>
                        )}

                        {data.nftCoreInfo?.story && data.nftCoreInfo.story.trim() !== '' && (
                          <div className="flex items-start gap-2 sm:gap-4 flex-wrap sm:flex-nowrap p-4 rounded-xl bg-gradient-to-r from-amber-50/50 to-yellow-50/30 dark:from-amber-900/20 dark:to-yellow-900/10 border border-amber-200/30 dark:border-amber-700/30">
                            <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold w-16 sm:w-20 flex-shrink-0 pt-1">{t('familyTree.nodeDetail.story', 'Story')}</span>
                            <div className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap font-medium flex-1 min-w-0 break-words break-all sm:break-words text-left">
                              {data.nftCoreInfo.story}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="relative flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {t('person.fullStory', 'Biography')}
                    </h2>
                    <div className="flex items-center gap-3">
                      {data && data.fullStory && data.fullStory.length > 0 && (
                        <div className="inline-flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-700/50 bg-blue-50/50 dark:bg-blue-900/20 p-0.5 transition-colors">
                          <button
                            onClick={() => setViewMode('paragraph')}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'paragraph' ? 'bg-blue-600 text-white shadow-sm dark:shadow-blue-900/40' : 'text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40'}`}
                            title={t('person.viewParagraph', 'Paragraph Mode') as string}
                          >
                            <List size={14} />{t('person.paragraph', 'Paragraph')}
                          </button>
                          <button
                            onClick={() => setViewMode('raw')}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'raw' ? 'bg-blue-600 text-white shadow-sm dark:shadow-blue-900/40' : 'text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/40'}`}
                            title={t('person.viewRaw', 'Raw Mode') as string}
                          >
                            <FileText size={14} />{t('person.raw', 'Raw')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {viewMode === 'paragraph' && fullStoryParagraphs.length > 0 ? (
                    <div className="font-mono text-gray-700 dark:text-gray-200 text-xs sm:text-sm leading-loose tracking-wide space-y-3">
                      {chunkParagraphs.length > 0 ? (
                        chunkParagraphs.map((content, i) => (
                          <p key={i} className="whitespace-pre-wrap m-0 selection:bg-indigo-100/70 dark:selection:bg-indigo-800/30">{content}</p>
                        ))
                      ) : (
                        fullStoryParagraphs.map((p, i) => (
                          <p key={i} className="whitespace-pre-wrap m-0 selection:bg-indigo-100/70 dark:selection:bg-indigo-800/30">{p}</p>
                        ))
                      )}
                    </div>
                  ) : viewMode === 'paragraph' && fullStoryParagraphs.length === 0 && data && data.fullStory ? (
                    <div className="font-mono text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-loose tracking-wide text-xs sm:text-sm selection:bg-indigo-100/70 dark:selection:bg-indigo-800/30">{data.fullStory}</div>
                  ) : viewMode === 'raw' && data && data.fullStory ? (
                    <div className="font-mono text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-loose tracking-wide text-xs sm:text-sm selection:bg-indigo-100/70 dark:selection:bg-indigo-800/30 overflow-x-auto p-4 story-content-surface dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">{data.fullStory}</div>
                  ) : (
                    <div className="text-gray-400 italic text-sm py-6 text-center">
                      {t('person.noStory', 'No biographical content')}
                    </div>
                  )}
                </div>
                {data && data.storyMetadata && (
                  <div className="xl:hidden bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl shadow-gray-500/5 dark:shadow-gray-900/20 border border-gray-200/70 dark:border-gray-700/50 p-6 space-y-5 card-surface backdrop-blur-xl relative overflow-hidden">
                    {/* Subtle background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-cyan-50/15 dark:from-blue-900/10 dark:via-transparent dark:to-cyan-900/5 pointer-events-none rounded-2xl"></div>
                    
                    <h3 className="relative text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">{t('person.metadata', 'Metadata')}</h3>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div><dt className="text-gray-500 dark:text-gray-400">{t('person.tokenId', 'Token ID')}</dt><dd className="font-mono text-gray-800 dark:text-gray-200">#{data.tokenId}</dd></div>
                      <div><dt className="text-gray-500 dark:text-gray-400">{t('person.totalChunks', 'Total Chunks')}</dt><dd className="font-mono text-gray-800 dark:text-gray-200">{data.storyMetadata.totalChunks}</dd></div>
                      <div><dt className="text-gray-500 dark:text-gray-400">{t('person.totalLength', 'Total Length')}</dt><dd className="font-mono text-gray-800 dark:text-gray-200">{data.storyMetadata.totalLength}</dd></div>
                      <div className="col-span-2"><dt className="text-gray-500 dark:text-gray-400">{t('person.lastUpdate', 'Last Update')}</dt><dd className="font-mono text-xs">{formatDate(data.storyMetadata.lastUpdateTime)}</dd></div>
                      <div className="col-span-2">
                        <dt className="text-gray-500 dark:text-gray-400">{t('person.storyHash', 'Story Hash')}</dt>
                        <dd className="mt-1 flex items-center gap-1">
                          <div className="font-mono text-[9px] break-all bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded select-all text-gray-700 dark:text-gray-300">
                            {data.storyMetadata.fullStoryHash}
                          </div>
                          <button
                            onClick={() => copyText(data.storyMetadata!.fullStoryHash)}
                            aria-label={t('search.copy')}
                            className="shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            title={t('search.copy')}
                          >
                            <Clipboard size={14} />
                          </button>
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-gray-500 dark:text-gray-400">{t('person.owner', 'Owner Address')}</dt>
                        <dd className="mt-1 flex items-center gap-1">
                        <div className="font-mono text-[9px] break-all bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded select-all text-gray-700 dark:text-gray-300" title={data.owner}>{shortAddress(data.owner) || '-'}</div>
                          {data.owner && (
                            <button
                              onClick={() => copyText(data.owner!)}
                              aria-label={t('search.copy')}
                              className="shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                              title={t('search.copy')}
                            >
                              <Clipboard size={14} />
                            </button>
                          )}
                        </dd>
                      </div>
                      {data.personHash && (
                        <div className="col-span-2">
                          <dt className="text-gray-500 dark:text-gray-400">{t('person.personHashLabel', 'Person Hash')}</dt>
                          <dd className="mt-1 flex items-center gap-1">
                            <div className="font-mono text-[9px] break-all bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded select-all text-gray-700 dark:text-gray-300">
                              {formatHashMiddle(data.personHash)}
                            </div>
                            <button
                              onClick={() => copyText(data.personHash!)}
                              aria-label={t('search.copy')}
                              className="shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                              title={t('search.copy')}
                            >
                              <Clipboard size={14} />
                            </button>
                          </dd>
                        </div>
                      )}
                      <div className="col-span-2 flex items-center justify-between pt-2 border-t">
                        <span className="text-gray-500 dark:text-gray-400">{t('person.status', 'Status')}</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wide font-medium ${data.storyMetadata.isSealed ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>{data.storyMetadata.isSealed ? t('person.sealed', 'Sealed') : t('person.editable', 'Editable')}</span>
                      </div>
                    </dl>
                  </div>
                )}
              </div>

              <div className="space-y-6 xl:sticky xl:top-20 xl:self-start">
                <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl shadow-gray-500/5 dark:shadow-gray-900/20 border border-gray-200/70 dark:border-gray-700/50 p-5 card-surface backdrop-blur-xl relative overflow-hidden group hover:shadow-3xl hover:shadow-gray-500/10 dark:hover:shadow-gray-900/30 transition-all duration-300">
                  {/* Subtle background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-transparent to-purple-50/15 dark:from-indigo-900/10 dark:via-transparent dark:to-purple-900/5 pointer-events-none rounded-2xl"></div>
                  
                  <h3 className="relative text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-5 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    <span>{t('person.chunkList', 'Chunk List')}</span>
                    {data && data.storyChunks && data.storyChunks.length > 0 && (
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">{data.storyChunks.length}</span>
                    )}
                  </h3>
                  {data && data.storyChunks && data.storyChunks.length > 0 ? (
                    <div className="space-y-2 max-h-[540px] overflow-auto pr-1 thin-scrollbar">
                      {data.storyChunks
                        .sort((a, b) => a.chunkIndex - b.chunkIndex)
                        .map((chunk) => {
                          const open = expandedChunks.has(chunk.chunkIndex)
                          const preview = chunk.content.length > 80 ? `${chunk.content.slice(0, 80)}...` : chunk.content
                          return (
                            <div key={chunk.chunkIndex} className="group border rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors relative border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60">
                              <button
                                onClick={() => toggleChunk(chunk.chunkIndex)}
                                className="w-full text-left flex items-start gap-2"
                              >
                                <span className="mt-0.5 text-gray-400 dark:text-gray-500">{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">#{chunk.chunkIndex}</span>
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">{chunk.content.length} {t('person.characters', 'characters')}</span>
                                  </div>
                                  {/* Reverted font sizing */}
                                  <div className={`text-xs text-gray-600 dark:text-gray-400 mt-1 ${open ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}> 
                                    {open ? chunk.content : preview}
                                  </div>
                                </div>
                              </button>
                              <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500 mt-2 pl-7">
                        <span className="flex items-center gap-1"><Clock size={10} />{formatUnixSeconds(chunk.timestamp)}</span>
                                <span className="flex items-center gap-1"><User size={10} />{chunk.lastEditor.slice(0, 6)}...</span>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500 text-sm italic py-4 text-center">
                      {t('person.noChunks', 'No chunks')}
                    </div>
                  )}
                </div>

                {data && data.storyMetadata && (
                  <div className="hidden xl:block bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl shadow-gray-500/5 dark:shadow-gray-900/20 border border-gray-200/70 dark:border-gray-700/50 p-5 space-y-5 card-surface backdrop-blur-xl relative overflow-hidden group hover:shadow-3xl hover:shadow-gray-500/10 dark:hover:shadow-gray-900/30 transition-all duration-300">
                    {/* Subtle background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-cyan-50/15 dark:from-blue-900/10 dark:via-transparent dark:to-cyan-900/5 pointer-events-none rounded-2xl"></div>
                    
                    <div className="relative">
                      <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">{t('person.metadata', 'Metadata')}</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('person.tokenId', 'Token ID')}</span><span className="font-mono text-gray-800 dark:text-gray-200">#{data.tokenId}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('person.totalChunks', 'Total Chunks')}</span><span className="font-mono text-gray-800 dark:text-gray-200">{data.storyMetadata.totalChunks}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('person.totalLength', 'Total Length')}</span><span className="font-mono text-gray-800 dark:text-gray-200">{data.storyMetadata.totalLength}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">{t('person.lastUpdate', 'Last Update')}</span><span className="font-mono text-[11px]">{formatDate(data.storyMetadata.lastUpdateTime)}</span></div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-gray-500 dark:text-gray-400">{t('person.status', 'Status')}</span>
                          <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${data.storyMetadata.isSealed ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>{data.storyMetadata.isSealed ? t('person.sealed', 'Sealed') : t('person.editable', 'Editable')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t space-y-3">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-[11px] mb-1">{t('person.storyHash', 'Story Hash')}</div>
                        <div className="flex items-center gap-0">
                          <div className="font-mono text-[10px] break-all bg-gray-50 dark:bg-gray-900 p-2 rounded select-all text-gray-700 dark:text-gray-300 flex-1">
                            {data.storyMetadata.fullStoryHash}
                          </div>
                          <button
                            onClick={() => copyText(data.storyMetadata!.fullStoryHash)}
                            aria-label={t('search.copy')}
                            className="shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            title={t('search.copy')}
                          >
                            <Clipboard size={14} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400 text-[11px] mb-1">{t('person.owner', 'Owner Address')}</div>
                        <div className="flex items-center gap-0">
                        <div className="font-mono text-[10px] break-all bg-gray-50 dark:bg-gray-900 p-2 rounded select-all text-gray-700 dark:text-gray-300 flex-1" title={data.owner}>{shortAddress(data.owner) || '-'}</div>
                          {data.owner && (
                            <button
                              onClick={() => copyText(data.owner!)}
                              aria-label={t('search.copy')}
                              className="shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                              title={t('search.copy')}
                            >
                              <Clipboard size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      {data.personHash && (
                        <div>
                          <div className="text-gray-500 dark:text-gray-400 text-[11px] mb-1">{t('person.personHashLabel', 'Person Hash')}</div>
                          <div className="flex items-center gap-0">
                            <div className="font-mono text-[10px] break-all bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded select-all text-gray-700 dark:text-gray-300">
                              {formatHashMiddle(data.personHash)}
                            </div>
                            <button
                              onClick={() => copyText(data.personHash!)}
                              aria-label={t('search.copy')}
                              className="shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                              title={t('search.copy')}
                            >
                              <Clipboard size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Editor moved to /editor/:tokenId */}
    </div>
  )
}

function HashAndIndexLine({ personHash, versionIndex, t }: { personHash: string, versionIndex?: number, t: any }) {
  const [copied, setCopied] = useState(false)
  // Removed inline expansion state; rely on title tooltip
  const copy = () => {
    try { navigator.clipboard.writeText(personHash) } catch {}
    setCopied(true)
    setTimeout(()=>setCopied(false), 1200)
  }
  const cfg = useConfig()
  const navigate = useNavigate()
  const goViz = () => {
    if (!versionIndex || versionIndex <= 0) return
    cfg.update({ rootHash: personHash, rootVersionIndex: versionIndex })
    navigate(`/familyTree?root=${personHash}&v=${versionIndex}`)
  }
  const shortHash = useMemo(() => formatHashMiddle(personHash, 7, 5), [personHash])
  return (
    <div className="flex items-center gap-3 font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-2 min-w-0">
        <span className="shrink-0 text-gray-500 dark:text-gray-500/70 xs:inline">{t('person.personHashLabel','Person Hash:')}</span>
        <span
          className="whitespace-nowrap select-text"
          title={personHash}
        >{shortHash}</span>
        <button
          onClick={copy}
          className={`shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs transition-colors ${copied ? 'bg-green-600 border-green-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          aria-label={copied ? (t('common.copied','Copied') as string) : (t('common.copy','Copy') as string)}
          title={copied ? (t('common.copied','Copied') as string) : (t('common.copy','Copy') as string)}
        >
          <Copy size={12} />
          <span className="hidden sm:inline">{copied ? t('common.copied','Copied') : t('common.copy','Copy')}</span>
        </button>
        {versionIndex !== undefined && versionIndex > 0 && (
          <>
            <span className="ml-2 shrink-0 whitespace-nowrap text-gray-500 dark:text-gray-500/80">v{versionIndex}</span>
            <button
              onClick={goViz}
              className="ml-2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 text-xs transition-colors"
              title={t('person.viewFamilyTree','View Family Tree') as string}
              aria-label={t('person.viewFamilyTree','View Family Tree') as string}
            >
              <GitBranch size={12} />
              <span className="hidden sm:inline">{t('person.viewFamilyTree','Family Tree')}</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
