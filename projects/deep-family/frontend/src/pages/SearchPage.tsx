import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import { ChevronDown } from 'lucide-react'
import { useConfig } from '../context/ConfigContext'
import { useToast } from '../components/ToastProvider'
import DeepFamily from '../abi/DeepFamily.json'
import { formatUnixSeconds } from '../types/graph'
import { makeProvider } from '../utils/provider'
import PersonHashCalculator from '../components/PersonHashCalculator'

const MAX_FULL_NAME_BYTES = 256
const MAX_PAGE_SIZE = 100  
const DEFAULT_PAGE_SIZE = 20

const getByteLength = (str: string): number => {
  return new TextEncoder().encode(str).length
}

import { formatHashMiddle } from '../types/graph'

const FieldError: React.FC<{ message?: string }> = ({ message }) => (
  <div className={`text-xs h-4 leading-4 ${message ? 'text-red-600' : 'text-transparent'}`}>
    {message || 'placeholder'}
  </div>
)

// Simple themed select (no native popup) for small option sets
const ThemedSelect: React.FC<{
  value: number
  onChange: (v: number) => void
  options: { value: number; label: string }[]
  className?: string
}> = ({ value, onChange, options, className = '' }) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const current = options.find(o => o.value === value)?.label ?? ''

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-left text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{current}</span>
        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
          <ul role="listbox" className="max-h-60 overflow-auto">
            {options.map((o) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`px-3 py-2 text-sm cursor-pointer select-none transition-colors ${
                  o.value === value
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {o.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Type definitions for forms
type EndorsementStatsForm = {
  personHash: string
  pageSize: number
}

type TokenURIHistoryForm = {
  tokenId: number
  pageSize: number
}

type PersonVersionsForm = {
  personHash: string
  pageSize: number
}

type StoryChunksForm = {
  tokenId: number
  pageSize: number
}

type ChildrenForm = {
  parentHash: string
  parentVersionIndex: number
  pageSize: number
}

export default function SearchPage() {
  const { t } = useTranslation()
  const createSchemas = () => ({
    endorsementStats: z.object({
      personHash: z.string().min(1, t('search.validation.hashRequired')).regex(/^0x[a-fA-F0-9]{64}$/, t('search.validation.hashInvalid')),
      pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE),
    }),
    tokenURIHistory: z.object({
      tokenId: z.number().int().min(1, t('search.validation.tokenIdRequired')),
      pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE),
    }),
    personVersions: z.object({
      personHash: z.string().min(1, t('search.validation.hashRequired')).regex(/^0x[a-fA-F0-9]{64}$/, t('search.validation.hashInvalid')),
      pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE),
    }),
    storyChunks: z.object({
      tokenId: z.number().int().min(1, t('search.validation.tokenIdRequired')),
      pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE),
    }),
    children: z.object({
      parentHash: z.string().min(1, t('search.validation.hashRequired')).regex(/^0x[a-fA-F0-9]{64}$/, t('search.validation.hashInvalid')),
      parentVersionIndex: z.number().int().min(1, t('search.validation.tokenIdRequired')),
      pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE),
    }),
  })
  
  const schemas = createSchemas()
  const { rpcUrl, contractAddress } = useConfig()
  const toast = useToast()
  
  
  const [endorsementOffset, setEndorsementOffset] = useState<number>(0)
  const [endorsementLoading, setEndorsementLoading] = useState<boolean>(false)
  const [endorsementError, setEndorsementError] = useState<string | null>(null)
  const [endorsementData, setEndorsementData] = useState<{ versionIndices: number[], endorsementCounts: number[], tokenIds: number[] }>({ versionIndices: [], endorsementCounts: [], tokenIds: [] })
  const [endorsementTotal, setEndorsementTotal] = useState<number>(0)
  const [endorsementHasMore, setEndorsementHasMore] = useState<boolean>(false)
  
  const [uriOffset, setUriOffset] = useState<number>(0)
  const [uriLoading, setUriLoading] = useState<boolean>(false)
  const [uriError, setUriError] = useState<string | null>(null)
  const [uriData, setUriData] = useState<string[]>([])
  const [uriTotal, setUriTotal] = useState<number>(0)
  const [uriHasMore, setUriHasMore] = useState<boolean>(false)
  
  const [versionsOffset, setVersionsOffset] = useState<number>(0)
  const [versionsLoading, setVersionsLoading] = useState<boolean>(false)
  const [versionsError, setVersionsError] = useState<string | null>(null)
  const [versionsData, setVersionsData] = useState<any[]>([])
  const [versionsTotal, setVersionsTotal] = useState<number>(0)
  const [versionsHasMore, setVersionsHasMore] = useState<boolean>(false)
  
  const [storyChunksOffset, setStoryChunksOffset] = useState<number>(0)
  const [storyChunksLoading, setStoryChunksLoading] = useState<boolean>(false)
  const [storyChunksError, setStoryChunksError] = useState<string | null>(null)
  const [storyChunksData, setStoryChunksData] = useState<any[]>([])
  const [storyChunksTotal, setStoryChunksTotal] = useState<number>(0)
  const [storyChunksHasMore, setStoryChunksHasMore] = useState<boolean>(false)
  
  const [childrenOffset, setChildrenOffset] = useState<number>(0)
  const [childrenLoading, setChildrenLoading] = useState<boolean>(false)
  const [childrenError, setChildrenError] = useState<string | null>(null)
  const [childrenData, setChildrenData] = useState<{ childHashes: string[], childVersions: number[] }>({ childHashes: [], childVersions: [] })
  const [childrenTotal, setChildrenTotal] = useState<number>(0)
  const [childrenHasMore, setChildrenHasMore] = useState<boolean>(false)
  
  

  const [openSections, setOpenSections] = useState({
    hash: true,
    versions: false,
    endorsement: false,
    children: false,
    storyChunks: false,
    uri: false,
  })
  const toggle = (k: keyof typeof openSections) => setOpenSections(s => ({ ...s, [k]: !s[k] }))

  const { register: reg3, handleSubmit: hs3, formState: { errors: e3 }, watch: w3 } = useForm<EndorsementStatsForm>({
    resolver: zodResolver(schemas.endorsementStats),
    defaultValues: { personHash: '', pageSize: DEFAULT_PAGE_SIZE },
  })
  const { register: reg4, handleSubmit: hs4, formState: { errors: e4 }, watch: w4 } = useForm<TokenURIHistoryForm>({
    resolver: zodResolver(schemas.tokenURIHistory),
    defaultValues: { tokenId: 0, pageSize: DEFAULT_PAGE_SIZE },
  })
  const { register: reg5, handleSubmit: hs5, formState: { errors: e5 }, watch: w5 } = useForm<PersonVersionsForm>({
    resolver: zodResolver(schemas.personVersions),
    defaultValues: { personHash: '', pageSize: DEFAULT_PAGE_SIZE },
  })
  const { register: reg6, handleSubmit: hs6, formState: { errors: e6 }, watch: w6 } = useForm<StoryChunksForm>({
    resolver: zodResolver(schemas.storyChunks),
    defaultValues: { tokenId: 0, pageSize: DEFAULT_PAGE_SIZE },
  })
  const { register: reg7, handleSubmit: hs7, formState: { errors: e7 }, watch: w7 } = useForm<ChildrenForm>({
    resolver: zodResolver(schemas.children),
    defaultValues: { parentHash: '', parentVersionIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
  })

  const endorsementPageSize = useMemo(() => Number(w3('pageSize') || DEFAULT_PAGE_SIZE), [w3])
  const uriPageSize = useMemo(() => Number(w4('pageSize') || DEFAULT_PAGE_SIZE), [w4])
  const versionsPageSize = useMemo(() => Number(w5('pageSize') || DEFAULT_PAGE_SIZE), [w5])
  const storyChunksPageSize = useMemo(() => Number(w6('pageSize') || DEFAULT_PAGE_SIZE), [w6])
  const childrenPageSize = useMemo(() => Number(w7('pageSize') || DEFAULT_PAGE_SIZE), [w7])


  const onQueryEndorsementStats = async (data: EndorsementStatsForm, startOffset?: number) => {
    setEndorsementLoading(true); setEndorsementError(null)
    try {
      const provider = makeProvider(rpcUrl)
      const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, provider)
      const off = (startOffset !== undefined) ? startOffset : endorsementOffset
      const out = await contract.listVersionsEndorsementStats(data.personHash, off, data.pageSize)
      const versionIndices: number[] = Array.from(out?.[0] || []).map(Number)
      const endorsementCounts: number[] = Array.from(out?.[1] || []).map(Number)
      const tokenIds: number[] = Array.from(out?.[2] || []).map(Number)
      const totalVersions: number = Number(out?.[3] || 0)
      const more: boolean = Boolean(out?.[4])
      const nextOffset: number = Number(out?.[5] || 0)
      setEndorsementData({ versionIndices, endorsementCounts, tokenIds })
      setEndorsementTotal(totalVersions)
      setEndorsementHasMore(more)
      setEndorsementOffset(nextOffset)
    } catch (e: any) {
      setEndorsementError(e?.message || t('search.queryFailed'))
    } finally {
      setEndorsementLoading(false)
    }
  }

  const onResetEndorsementQuery = () => {
    setEndorsementData({ versionIndices: [], endorsementCounts: [], tokenIds: [] })
    setEndorsementTotal(0)
    setEndorsementHasMore(false)
    setEndorsementOffset(0)
    setEndorsementError(null)
  }

  const onEndorsementNext = async () => {
    await onQueryEndorsementStats({ personHash: w3('personHash') || '', pageSize: endorsementPageSize })
  }
  const onEndorsementPrev = async () => {
    const prev = Math.max(0, endorsementOffset - endorsementPageSize * 2)
    await onQueryEndorsementStats({ personHash: w3('personHash') || '', pageSize: endorsementPageSize }, prev)
  }

  const onQueryTokenURIHistory = async (data: TokenURIHistoryForm, startOffset?: number) => {
    setUriLoading(true); setUriError(null)
    try {
      const provider = makeProvider(rpcUrl)
      const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, provider)
      const off = (startOffset !== undefined) ? startOffset : uriOffset
      const out = await contract.listTokenURIHistory(data.tokenId, off, data.pageSize)
      const uris: string[] = Array.from(out?.[0] || [])
      const totalCount: number = Number(out?.[1] || 0)
      const more: boolean = Boolean(out?.[2])
      const nextOffset: number = Number(out?.[3] || 0)
      setUriData(uris)
      setUriTotal(totalCount)
      setUriHasMore(more)
      setUriOffset(nextOffset)
    } catch (e: any) {
      setUriError(e?.message || t('search.queryFailed'))
    } finally {
      setUriLoading(false)
    }
  }

  const onResetUriQuery = () => {
    setUriData([])
    setUriTotal(0)
    setUriHasMore(false)
    setUriOffset(0)
    setUriError(null)
  }

  const onUriNext = async () => {
    await onQueryTokenURIHistory({ tokenId: w4('tokenId') || 1, pageSize: uriPageSize })
  }
  const onUriPrev = async () => {
    const prev = Math.max(0, uriOffset - uriPageSize * 2)
    await onQueryTokenURIHistory({ tokenId: w4('tokenId') || 1, pageSize: uriPageSize }, prev)
  }

  const onQueryPersonVersions = async (data: PersonVersionsForm, startOffset?: number) => {
    setVersionsLoading(true); setVersionsError(null)
    try {
      const provider = makeProvider(rpcUrl)
      const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, provider)
      const off = (startOffset !== undefined) ? startOffset : versionsOffset
      const out = await contract.listPersonVersions(data.personHash, off, data.pageSize)
      const versions: any[] = Array.from(out?.[0] || [])
      const totalCount: number = Number(out?.[1] || 0)
      const more: boolean = Boolean(out?.[2])
      const nextOffset: number = Number(out?.[3] || 0)
      setVersionsData(versions)
      setVersionsTotal(totalCount)
      setVersionsHasMore(more)
      setVersionsOffset(nextOffset)
    } catch (e: any) {
      setVersionsError(e?.message || t('search.queryFailed'))
    } finally {
      setVersionsLoading(false)
    }
  }

  const onResetVersionsQuery = () => {
    setVersionsData([])
    setVersionsTotal(0)
    setVersionsHasMore(false)
    setVersionsOffset(0)
    setVersionsError(null)
  }

  const onVersionsNext = async () => {
    await onQueryPersonVersions({ personHash: w5('personHash') || '', pageSize: versionsPageSize })
  }
  const onVersionsPrev = async () => {
    const prev = Math.max(0, versionsOffset - versionsPageSize * 2)
    await onQueryPersonVersions({ personHash: w5('personHash') || '', pageSize: versionsPageSize }, prev)
  }

  const onQueryStoryChunks = async (data: StoryChunksForm, startOffset?: number) => {
    setStoryChunksLoading(true); setStoryChunksError(null)
    try {
      const provider = makeProvider(rpcUrl)
      const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, provider)
      const off = (startOffset !== undefined) ? startOffset : storyChunksOffset
      const out = await contract.listStoryChunks(data.tokenId, off, data.pageSize)
      const chunks: any[] = Array.from(out?.[0] || [])
      const totalChunks: number = Number(out?.[1] || 0)
      const more: boolean = Boolean(out?.[2])
      const nextOffset: number = Number(out?.[3] || 0)
      setStoryChunksData(chunks)
      setStoryChunksTotal(totalChunks)
      setStoryChunksHasMore(more)
      setStoryChunksOffset(nextOffset)
    } catch (e: any) {
      setStoryChunksError(e?.message || t('search.queryFailed'))
    } finally {
      setStoryChunksLoading(false)
    }
  }

  const onResetStoryChunksQuery = () => {
    setStoryChunksData([])
    setStoryChunksTotal(0)
    setStoryChunksHasMore(false)
    setStoryChunksOffset(0)
    setStoryChunksError(null)
  }

  const onStoryChunksNext = async () => {
    await onQueryStoryChunks({ tokenId: w6('tokenId') || 1, pageSize: storyChunksPageSize })
  }
  const onStoryChunksPrev = async () => {
    const prev = Math.max(0, storyChunksOffset - storyChunksPageSize * 2)
    await onQueryStoryChunks({ tokenId: w6('tokenId') || 1, pageSize: storyChunksPageSize }, prev)
  }

  const onQueryChildren = async (data: ChildrenForm, startOffset?: number) => {
    setChildrenLoading(true); setChildrenError(null)
    try {
      const provider = makeProvider(rpcUrl)
      const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, provider)
      const off = (startOffset !== undefined) ? startOffset : childrenOffset
      const out = await contract.listChildren(data.parentHash, data.parentVersionIndex, off, data.pageSize)
      const childHashes: string[] = Array.from(out?.[0] || [])
      const childVersions: number[] = Array.from(out?.[1] || []).map(Number)
      const totalChildren: number = Number(out?.[2] || 0)
      const more: boolean = Boolean(out?.[3])
      const nextOffset: number = Number(out?.[4] || 0)
      setChildrenData({ childHashes, childVersions })
      setChildrenTotal(totalChildren)
      setChildrenHasMore(more)
      setChildrenOffset(nextOffset)
    } catch (e: any) {
      setChildrenError(e?.message || t('search.queryFailed'))
    } finally {
      setChildrenLoading(false)
    }
  }

  const onResetChildrenQuery = () => {
    setChildrenData({ childHashes: [], childVersions: [] })
    setChildrenTotal(0)
    setChildrenHasMore(false)
    setChildrenOffset(0)
    setChildrenError(null)
  }

  const onChildrenNext = async () => {
    await onQueryChildren({ parentHash: w7('parentHash') || '', parentVersionIndex: w7('parentVersionIndex') || 1, pageSize: childrenPageSize })
  }
  const onChildrenPrev = async () => {
    const prev = Math.max(0, childrenOffset - childrenPageSize * 2)
    await onQueryChildren({ parentHash: w7('parentHash') || '', parentVersionIndex: w7('parentVersionIndex') || 1, pageSize: childrenPageSize }, prev)
  }

  

  return (
    <div className="space-y-4 text-gray-900 dark:text-gray-100 pb-4 md:pb-0">
      {/* Hash Calculator Section */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="bg-teal-50 dark:bg-gray-800/60 px-4 py-2 flex items-center justify-between cursor-pointer border-b border-gray-200 dark:border-gray-700/60" onClick={() => toggle('hash')}>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('search.hashCalculator.title')}</h3>
          <button type="button" className="text-sm px-2 py-1 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={(e) => { e.stopPropagation(); toggle('hash') }} aria-expanded={openSections.hash}>{openSections.hash ? '-' : '+'}</button>
        </div>
        {openSections.hash && (
          <div className="p-2 space-y-2">
            <div className="text-xs text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800/40">
              {t('search.hashCalculator.tip')}
            </div>
            <div className="w-full">
              <PersonHashCalculator
                showTitle={false}
                collapsible={false}
                className="border-0 shadow-none bg-transparent"
              />
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-500">{t('search.hashCalculator.description')}</p>
          </div>
        )}
      </div>
      {/* Versions Section */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="bg-orange-50 dark:bg-gray-800/60 px-4 py-2 flex items-center justify-between cursor-pointer border-b border-gray-200 dark:border-gray-700/60" onClick={() => toggle('versions')}>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('search.versionsQuery.title')}</h3>
          <button type="button" className="text-sm px-2 py-1 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={(e) => { e.stopPropagation(); toggle('versions') }} aria-expanded={openSections.versions}>{openSections.versions ? '-' : '+'}</button>
        </div>
        {openSections.versions && (
          <div className="p-2 space-y-2">
        <form onSubmit={hs5((d) => onQueryPersonVersions(d, 0))} className="flex flex-wrap gap-2 items-center">
          <div className="basis-full sm:basis-[560px] md:basis-[560px] grow-0 shrink-0">
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">{t('search.versionsQuery.personHash')}</label>
            <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/30 dark:focus:ring-blue-400/30" placeholder={t('search.versionsQuery.placeholder')}
              {...reg5('personHash')} />
            <FieldError message={e5.personHash?.message as any} />
          </div>
          <div className="basis-auto">
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">{t('search.nameQuery.pageSize')}</label>
            <input type="number" className="w-20 sm:w-24 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/30 dark:focus:ring-blue-400/30" {...reg5('pageSize', { valueAsNumber: true })} />
            <FieldError message={e5.pageSize?.message as any} />
          </div>
          <div className="flex gap-2 items-center self-center">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={versionsLoading}>{t('search.query')}</button>
            <button type="button" onClick={onResetVersionsQuery} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('search.reset')}</button>
          </div>
        </form>
        <div className="text-xs text-gray-600 dark:text-gray-400">{t('search.totalResults')}: {versionsTotal}</div>
        <div className="rounded border border-gray-200 dark:border-gray-700/60 divide-y dark:divide-gray-700/60">
          {versionsData.length === 0 ? (
            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
              {versionsLoading ? t('search.loading') : t('search.noData')}
            </div>
          ) : versionsData.map((version, i) => (
            <div key={i} className="p-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm mb-2">
                <div className="shrink-0"><span className="text-gray-600 dark:text-gray-400">{t('search.versionsQuery.versionIndex')}:</span> {Number(version.versionIndex)}</div>
                <div className="flex items-center gap-1 min-w-0 max-w-full">
                  <span className="shrink-0 text-gray-600 dark:text-gray-400">{t('search.versionsQuery.creator')}:</span>
                  <HashInline value={String(version.addedBy || '')} className="font-mono text-xs text-gray-800 dark:text-gray-300" />
                  <button
                    className="whitespace-nowrap text-[11px] px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={async () => {
                      const value = String(version.addedBy || '')
                      try {
                        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                          await navigator.clipboard.writeText(value)
                          toast.show(t('search.copied'))
                          return
                        }
                      } catch {}
                      try {
                        const ta = document.createElement('textarea')
                        ta.value = value
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
                    }}
                  >{t('search.copy')}</button>
                </div>
              <div className="min-w-0"><span className="text-gray-600 dark:text-gray-400">{t('search.versionsQuery.addTime')}:</span> <span className="font-mono text-xs text-gray-800 dark:text-gray-300">{version.timestamp ? formatUnixSeconds(version.timestamp) : t('search.versionsQuery.unknown')}</span></div>
              </div>
              <div className="text-sm space-y-1">
                <div><span className="text-gray-600 dark:text-gray-400">{t('search.versionsQuery.versionTag')}:</span> {version.tag || t('search.versionsQuery.none')} {version.metadataCID && <><span className="text-gray-600 dark:text-gray-400 ml-4">{t('search.versionsQuery.metadataCID')}:</span> <span className="font-mono text-xs break-all text-gray-800 dark:text-gray-300">{version.metadataCID}</span></>}</div>
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="shrink-0 text-gray-600 dark:text-gray-400">{t('search.versionsQuery.fatherHash')}:</span>
                  <HashInline value={version.fatherHash} className="font-mono text-xs text-gray-800 dark:text-gray-300" />
                  <button
                    className="whitespace-nowrap text-[11px] px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={async () => {
                      const value = String(version.fatherHash || '')
                      try {
                        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                          await navigator.clipboard.writeText(value)
                          toast.show(t('search.copied'))
                          return
                        }
                      } catch {}
                      try {
                        const ta = document.createElement('textarea')
                        ta.value = value
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
                    }}
                  >{t('search.copy')}</button>
                </div>
                <div><span className="text-gray-600 dark:text-gray-400">{t('search.versionsQuery.fatherVersion')}:</span> {Number(version.fatherVersionIndex)}</div>
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="shrink-0 text-gray-600 dark:text-gray-400">{t('search.versionsQuery.motherHash')}:</span>
                  <HashInline value={version.motherHash} className="font-mono text-xs text-gray-800 dark:text-gray-300" />
                  <button
                    className="whitespace-nowrap text-[11px] px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={async () => {
                      const value = String(version.motherHash || '')
                      try {
                        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                          await navigator.clipboard.writeText(value)
                          toast.show(t('search.copied'))
                          return
                        }
                      } catch {}
                      try {
                        const ta = document.createElement('textarea')
                        ta.value = value
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
                    }}
                  >{t('search.copy')}</button>
                </div>
                <div><span className="text-gray-600 dark:text-gray-400">{t('search.versionsQuery.motherVersion')}:</span> {Number(version.motherVersionIndex)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onVersionsPrev} disabled={versionsLoading || versionsOffset === 0} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">{t('search.prev')}</button>
          <button onClick={onVersionsNext} disabled={versionsLoading || !versionsHasMore} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">{t('search.next')}</button>
          <div className="text-xs text-gray-500 dark:text-gray-500">{t('search.offset')}: {versionsOffset}</div>
        </div>
        {versionsError && <div className="text-sm text-red-600 dark:text-red-400">{versionsError}</div>}
          </div>
        )}
      </div>
      {/* Endorsement Stats Section */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="bg-green-50 dark:bg-gray-800/60 px-4 py-2 flex items-center justify-between cursor-pointer border-b border-gray-200 dark:border-gray-700/60" onClick={() => toggle('endorsement')}>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('search.endorsementQuery.title')}</h3>
          <button type="button" className="text-sm px-2 py-1 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={(e) => { e.stopPropagation(); toggle('endorsement') }} aria-expanded={openSections.endorsement}>{openSections.endorsement ? '-' : '+'}</button>
        </div>
        {openSections.endorsement && (
          <div className="p-2 space-y-2">
        <form onSubmit={hs3((d) => onQueryEndorsementStats(d, 0))} className="flex flex-wrap gap-2 items-center">
          <div className="basis-full sm:basis-[560px] md:basis-[560px] grow-0 shrink-0">
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">{t('search.endorsementQuery.personHash')}</label>
            <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/30 dark:focus:ring-blue-400/30" placeholder={t('search.endorsementQuery.placeholder')}
              {...reg3('personHash')} />
            <FieldError message={e3.personHash?.message as any} />
          </div>
          <div className="basis-auto">
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">{t('search.nameQuery.pageSize')}</label>
            <input type="number" className="w-20 sm:w-24 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/30 dark:focus:ring-blue-400/30" {...reg3('pageSize', { valueAsNumber: true })} />
            <FieldError message={e3.pageSize?.message as any} />
          </div>
          <div className="flex gap-2 items-center self-center">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={endorsementLoading}>{t('search.query')}</button>
            <button type="button" onClick={onResetEndorsementQuery} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('search.reset')}</button>
          </div>
        </form>
        <div className="text-xs text-gray-600 dark:text-gray-400">{t('search.totalResults')}: {endorsementTotal}</div>
        <div className="rounded border border-gray-200 dark:border-gray-700/60 divide-y dark:divide-gray-700/60">
          {endorsementData.versionIndices.length === 0 ? (
            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
              {endorsementLoading ? t('search.loading') : t('search.noData')}
            </div>
          ) : endorsementData.versionIndices.map((versionIndex, i) => (
            <div key={i} className="p-2">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <div><span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{t('search.endorsementQuery.version')}:</span> {versionIndex}</div>
                <div><span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{t('search.endorsementQuery.endorsementCount')}:</span> {endorsementData.endorsementCounts[i]}</div>
                <div><span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{t('search.endorsementQuery.tokenId')}:</span> {endorsementData.tokenIds[i]}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEndorsementPrev} disabled={endorsementLoading || endorsementOffset === 0} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">{t('search.prev')}</button>
          <button onClick={onEndorsementNext} disabled={endorsementLoading || !endorsementHasMore} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">{t('search.next')}</button>
          <div className="text-xs text-gray-500 dark:text-gray-500">{t('search.offset')}: {endorsementOffset}</div>
        </div>
        {endorsementError && <div className="text-sm text-red-600 dark:text-red-400">{endorsementError}</div>}
          </div>
        )}
      </div>
      {/* Children Query Section */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="bg-rose-50 dark:bg-gray-800/60 px-4 py-2 flex items-center justify-between cursor-pointer border-b border-gray-200 dark:border-gray-700/60" onClick={() => toggle('children')}>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('search.childrenQuery.title')}</h3>
          <button type="button" className="text-sm px-2 py-1 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={(e) => { e.stopPropagation(); toggle('children') }} aria-expanded={openSections.children}>{openSections.children ? '-' : '+'}</button>
        </div>
        {openSections.children && (
          <div className="p-2 space-y-2">
        <form onSubmit={hs7((d) => onQueryChildren(d, 0))} className="flex flex-wrap gap-2 items-center">
          <div className="basis-full sm:basis-[560px] md:basis-[560px] grow-0 shrink-0">
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">{t('search.childrenQuery.parentHash')}</label>
            <input className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/30 dark:focus:ring-blue-400/30" placeholder={t('search.childrenQuery.parentHashPlaceholder')}
              {...reg7('parentHash')} />
            <FieldError message={e7.parentHash?.message as any} />
          </div>
          <div className="basis-auto">
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">{t('search.childrenQuery.parentVersion')}</label>
            <input type="number" className="w-28 sm:w-32 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/30 dark:focus:ring-blue-400/30" placeholder={t('search.childrenQuery.parentVersionPlaceholder')}
              {...reg7('parentVersionIndex', { valueAsNumber: true })} />
            <FieldError message={e7.parentVersionIndex?.message as any} />
          </div>
          <div className="basis-auto">
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">{t('search.nameQuery.pageSize')}</label>
            <input type="number" className="w-20 sm:w-24 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/30 dark:focus:ring-blue-400/30" {...reg7('pageSize', { valueAsNumber: true })} />
            <FieldError message={e7.pageSize?.message as any} />
          </div>
          <div className="flex gap-2 items-center self-center">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={childrenLoading}>{t('search.query')}</button>
            <button type="button" onClick={onResetChildrenQuery} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('search.reset')}</button>
          </div>
        </form>
        <div className="text-xs text-gray-600 dark:text-gray-400">{t('search.childrenQuery.totalChildren')}: {childrenTotal}</div>
        <div className="rounded border border-gray-200 dark:border-gray-700/60 divide-y dark:divide-gray-700/60">
          {childrenData.childHashes.length === 0 ? (
            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
              {childrenLoading ? t('search.loading') : t('search.noData')}
            </div>
          ) : childrenData.childHashes.map((childHash, i) => (
            <div key={i} className="p-2">
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-1 overflow-hidden"><span className="shrink-0 text-gray-600 dark:text-gray-400">{t('search.childrenQuery.childHash')}:</span> <HashInline value={childHash} className="font-mono text-xs text-gray-800 dark:text-gray-300" />
                <button
                  className="whitespace-nowrap text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={async () => {
                  try {
                    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                      await navigator.clipboard.writeText(childHash)
                      toast.show(t('search.copied'))
                      return
                    }
                  } catch {}
                  try {
                    const ta = document.createElement('textarea')
                    ta.value = childHash
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
                }}
                >{t('search.copy')}</button></div>
                <div><span className="text-gray-600 dark:text-gray-400">{t('search.childrenQuery.childVersion')}:</span> {childrenData.childVersions[i]}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onChildrenPrev} disabled={childrenLoading || childrenOffset === 0} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">{t('search.prev')}</button>
          <button onClick={onChildrenNext} disabled={childrenLoading || !childrenHasMore} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">{t('search.next')}</button>
          <div className="text-xs text-gray-500 dark:text-gray-500">{t('search.offset')}: {childrenOffset}</div>
        </div>
        {childrenError && <div className="text-sm text-red-600 dark:text-red-400">{childrenError}</div>}
          </div>
        )}
      </div>
      {/* Story Chunks Query Section */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="bg-indigo-50 dark:bg-gray-800/60 px-4 py-2 flex items-center justify-between cursor-pointer border-b border-gray-200 dark:border-gray-700/60" onClick={() => toggle('storyChunks')}>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('search.storyChunksQuery.title')}</h3>
          <button type="button" className="text-sm px-2 py-1 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={(e) => { e.stopPropagation(); toggle('storyChunks') }} aria-expanded={openSections.storyChunks}>{openSections.storyChunks ? '-' : '+'}</button>
        </div>
        {openSections.storyChunks && (
          <div className="p-2 space-y-2">
        <form onSubmit={hs6((d) => onQueryStoryChunks(d, 0))} className="flex flex-wrap gap-2 items-center">
          <div className="basis-auto">
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">{t('search.storyChunksQuery.tokenId')}</label>
            <input type="number" className="w-36 sm:w-40 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/30 dark:focus:ring-blue-400/30" placeholder={t('search.storyChunksQuery.placeholder')}
              {...reg6('tokenId', { valueAsNumber: true })} />
            <FieldError message={e6.tokenId?.message as any} />
          </div>
          <div className="basis-auto">
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">{t('search.nameQuery.pageSize')}</label>
            <input type="number" className="w-20 sm:w-24 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/30 dark:focus:ring-blue-400/30" {...reg6('pageSize', { valueAsNumber: true })} />
            <FieldError message={e6.pageSize?.message as any} />
          </div>
          <div className="flex gap-2 items-center self-center">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={storyChunksLoading}>{t('search.query')}</button>
            <button type="button" onClick={onResetStoryChunksQuery} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('search.reset')}</button>
          </div>
        </form>
        <div className="text-xs text-gray-600 dark:text-gray-400">{t('search.storyChunksQuery.totalChunks')}: {storyChunksTotal}</div>
        <div className="rounded border border-gray-200 dark:border-gray-700/60 divide-y dark:divide-gray-700/60">
          {storyChunksData.length === 0 ? (
            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
              {storyChunksLoading ? t('search.loading') : t('search.noData')}
            </div>
          ) : storyChunksData.map((chunk, i) => (
            <div key={i} className="p-2">
              {/* Index then timestamp on the same line */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-2">
                <div><span className="text-gray-600 dark:text-gray-400">{t('search.storyChunksQuery.chunkIndex')}:</span> {Number(chunk.chunkIndex)}</div>
                <div><span className="text-gray-600 dark:text-gray-400">{t('search.storyChunksQuery.timestamp')}:</span> <span className="font-mono text-xs text-gray-800 dark:text-gray-300">{chunk.timestamp ? formatUnixSeconds(chunk.timestamp) : t('search.versionsQuery.unknown')}</span></div>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="shrink-0 text-gray-600 dark:text-gray-400">{t('search.storyChunksQuery.chunkHash')}:</span>
                  <HashInline value={chunk.chunkHash} className="font-mono text-xs text-gray-800 dark:text-gray-300" />
                  <button
                    className="whitespace-nowrap text-[11px] px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={async () => {
                      const value = String(chunk.chunkHash || '')
                      try {
                        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                          await navigator.clipboard.writeText(value)
                          toast.show(t('search.copied'))
                          return
                        }
                      } catch {}
                      try {
                        const ta = document.createElement('textarea')
                        ta.value = value
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
                    }}
                  >{t('search.copy')}</button>
                </div>
                <div className="flex items-center gap-1 overflow-hidden">
                  <span className="shrink-0 text-gray-600 dark:text-gray-400">{t('search.storyChunksQuery.lastEditor')}:</span>
                  <HashInline value={String(chunk.lastEditor || '')} className="font-mono text-xs text-gray-800 dark:text-gray-300" />
                  {chunk.lastEditor && (
                    <button
                      className="whitespace-nowrap text-[11px] px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={async () => {
                        const value = String(chunk.lastEditor || '')
                        try {
                          if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                            await navigator.clipboard.writeText(value)
                            toast.show(t('search.copied'))
                            return
                          }
                        } catch {}
                        try {
                          const ta = document.createElement('textarea')
                          ta.value = value
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
                      }}
                    >{t('search.copy')}</button>
                  )}
                </div>
                <div><span className="text-gray-600 dark:text-gray-400">{t('search.storyChunksQuery.contentPreview')}:</span></div>
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs max-h-20 overflow-y-auto">{chunk.content || t('search.noData')}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onStoryChunksPrev} disabled={storyChunksLoading || storyChunksOffset === 0} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">{t('search.prev')}</button>
          <button onClick={onStoryChunksNext} disabled={storyChunksLoading || !storyChunksHasMore} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">{t('search.next')}</button>
          <div className="text-xs text-gray-500 dark:text-gray-500">{t('search.offset')}: {storyChunksOffset}</div>
        </div>
        {storyChunksError && <div className="text-sm text-red-600 dark:text-red-400">{storyChunksError}</div>}
          </div>
        )}
      </div>
      {/* URI History Section */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="bg-purple-50 dark:bg-gray-800/60 px-4 py-2 flex items-center justify-between cursor-pointer border-b border-gray-200 dark:border-gray-700/60" onClick={() => toggle('uri')}>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t('search.uriQuery.title')}</h3>
          <button type="button" className="text-sm px-2 py-1 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={(e) => { e.stopPropagation(); toggle('uri') }} aria-expanded={openSections.uri}>{openSections.uri ? '-' : '+'}</button>
        </div>
        {openSections.uri && (
          <div className="p-2 space-y-2">
        <form onSubmit={hs4((d) => onQueryTokenURIHistory(d, 0))} className="flex flex-wrap gap-2 items-center">
          <div className="basis-auto">
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">{t('search.uriQuery.tokenId')}</label>
            <input type="number" className="w-36 sm:w-40 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/30 dark:focus:ring-blue-400/30" placeholder={t('search.uriQuery.placeholder')}
              {...reg4('tokenId', { valueAsNumber: true })} />
            <FieldError message={e4.tokenId?.message as any} />
          </div>
          <div className="basis-auto">
            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">{t('search.nameQuery.pageSize')}</label>
            <input type="number" className="w-20 sm:w-24 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/30 dark:focus:ring-blue-400/30" {...reg4('pageSize', { valueAsNumber: true })} />
            <FieldError message={e4.pageSize?.message as any} />
          </div>
          <div className="flex gap-2 items-center self-center">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={uriLoading}>{t('search.query')}</button>
            <button type="button" onClick={onResetUriQuery} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('search.reset')}</button>
          </div>
        </form>
        <div className="text-xs text-gray-600 dark:text-gray-400">{t('search.totalResults')}: {uriTotal}</div>
        <div className="rounded border border-gray-200 dark:border-gray-700/60 divide-y dark:divide-gray-700/60">
          {uriData.length === 0 ? (
            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
              {uriLoading ? t('search.loading') : t('search.noData')}
            </div>
          ) : uriData.map((uri, i) => (
            <div key={i} className="p-2 flex items-center gap-2 overflow-hidden">
              <span className="min-w-0 flex-1 font-mono text-sm truncate text-gray-800 dark:text-gray-200" title={uri}>{uri}</span>
              <button
                className="whitespace-nowrap text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={async () => {
                  try {
                    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                      await navigator.clipboard.writeText(uri)
                      toast.show(t('search.copied'))
                      return
                    }
                  } catch {}
                  try {
                    const ta = document.createElement('textarea')
                    ta.value = uri
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
                }}
              >{t('search.copy')}</button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onUriPrev} disabled={uriLoading || uriOffset === 0} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">{t('search.prev')}</button>
          <button onClick={onUriNext} disabled={uriLoading || !uriHasMore} className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">{t('search.next')}</button>
          <div className="text-xs text-gray-500 dark:text-gray-500">{t('search.offset')}: {uriOffset}</div>
        </div>
        {uriError && <div className="text-sm text-red-600 dark:text-red-400">{uriError}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
// Inline hash renderer: shows full when fits; otherwise 10...8 middle ellipsis
const HashInline: React.FC<{ value: string; className?: string; titleText?: string; prefix?: number; suffix?: number }> = ({ value, className = '', titleText, prefix = 10, suffix = 8 }) => {
  const containerRef = useRef<HTMLSpanElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState<string>(value)

  const recompute = () => {
    const container = containerRef.current
    const meas = measureRef.current
    if (!container || !meas) return
    meas.textContent = value
    const fits = meas.scrollWidth <= container.clientWidth
    setDisplay(fits ? value : formatHashMiddle(value, prefix, suffix))
  }

  useEffect(() => {
    recompute()
    const ro = new ResizeObserver(() => recompute())
    if (containerRef.current) ro.observe(containerRef.current)
    const onResize = () => recompute()
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [value, prefix, suffix])

  return (
    <>
      <span ref={containerRef} className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap ${className}`} title={titleText ?? value}>
        {display}
      </span>
      {/* measurement node mirrors font styles to ensure accurate width */}
      <span ref={measureRef} className={`absolute left-[-99999px] top-0 invisible whitespace-nowrap ${className}`} />
    </>
  )
}
