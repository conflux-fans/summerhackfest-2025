import { useState, useEffect } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { useTranslation } from 'react-i18next'
import { useConfig } from '../context/ConfigContext'
import { formatHashMiddle, shortAddress } from '../types/graph'
import { Clipboard } from 'lucide-react'
import { useTreeData } from '../context/TreeDataContext'
import { useToast } from './ToastProvider'

interface Props {
  editing: boolean
  setEditing: (v: boolean) => void
  // Status bar props
  contractMessage?: string
  loading?: boolean
  onRefresh?: () => void
  t: any
  // Traversal and stats props
  traversal: 'dfs' | 'bfs'
  setTraversal: (t: 'dfs' | 'bfs') => void
  progress?: { created: number; visited: number; depth: number }
}

export default function FamilyTreeConfigForm({ editing, setEditing, contractMessage, loading, onRefresh, t: statusT, traversal, setTraversal, progress }: Props) {
  const { t } = useTranslation()
  const { rpcUrl, contractAddress, rootHash, rootVersionIndex, update, rootHistory, removeRootFromHistory, clearRootHistory, defaults } = useConfig()
  const { clearAllCaches } = useTreeData()
  const [localRpcUrl, setLocalRpcUrl] = useState(rpcUrl)
  const [localContractAddress, setLocalContractAddress] = useState(contractAddress)
  const [localRootHash, setLocalRootHash] = useState(rootHash)
  const [localVersion, setLocalVersion] = useState(rootVersionIndex)
  const [errors, setErrors] = useState<{ rpc?: string; contract?: string; root?: string }>({})
  const toast = useToast()
  const copy = async (text: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text)
        try { toast.show(t('search.copied')) } catch {}
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
      document.execCommand('copy')
      document.body.removeChild(ta)
      try { toast.show(t('search.copied')) } catch {}
    } catch {}
  }

  // sync external changes
  useEffect(() => {
    setLocalRpcUrl(rpcUrl)
    setLocalContractAddress(contractAddress)
    setLocalRootHash(rootHash)
    setLocalVersion(rootVersionIndex)
  }, [rpcUrl, contractAddress, rootHash, rootVersionIndex])

  // load history when entering edit mode
  useEffect(() => { /* history now from global context; nothing to do here */ }, [editing])

  // responsive-only: small screens show shortened text; larger screens show full text

  const hasDiff = (
    localRpcUrl !== rpcUrl ||
    localContractAddress !== contractAddress ||
    localRootHash !== rootHash ||
    localVersion !== rootVersionIndex
  )

  const resetToDefaults = () => {
    setLocalRpcUrl(defaults.rpcUrl)
    setLocalContractAddress(defaults.contractAddress)
    setLocalRootHash(defaults.rootHash)
    setLocalVersion(defaults.rootVersionIndex)
  }

  const applyConfigChanges = () => {
    if (!validateAll()) return
    update({
      rpcUrl: localRpcUrl,
      contractAddress: localContractAddress,
      rootHash: localRootHash,
      rootVersionIndex: localVersion,
    })
    setEditing(false)
    // Proactively refresh after saving config
    onRefresh?.()
  }

  const cancel = () => {
    setLocalRpcUrl(rpcUrl)
    setLocalContractAddress(contractAddress)
    setLocalRootHash(rootHash)
    setLocalVersion(rootVersionIndex)
    setEditing(false)
  }

  // version apply (only for non-edit mode)
  const applyVersion = () => {
    if (editing) return // Don't auto-apply in edit mode
    update({ rootVersionIndex: localVersion })
    // Proactively refresh after changing version
    onRefresh?.()
  }

  // validation helpers
  const isAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v.trim())
  const isHash32 = (v: string) => /^0x[a-fA-F0-9]{64}$/.test(v.trim())
  const isUrl = (v: string) => /^https?:\/\//i.test(v) || v.startsWith('/')
  const validateAll = () => {
    const next: typeof errors = {}
    if (!isUrl(localRpcUrl)) next.rpc = 'familyTree.validation.rpc'
    if (!isAddress(localContractAddress)) next.contract = 'familyTree.validation.contract'
    if (!isHash32(localRootHash)) next.root = 'familyTree.validation.root'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  useEffect(() => { if (editing) validateAll() }, [editing, localRpcUrl, localContractAddress, localRootHash])

  // debounce version change (auto apply after 600ms idle, only in non-edit mode)
  useDebounce(localVersion, 600, v => { if (!editing && v !== rootVersionIndex) applyVersion() })

  // Status badge logic
  const getStatusBadge = () => {
    let bgClass, borderClass, textClass, text

    if (loading) {
      bgClass = 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/30'
      borderClass = 'border-amber-300/60 dark:border-amber-600/40'
      textClass = 'text-amber-700 dark:text-amber-300'
      text = statusT ? statusT('familyTree.status.badge.checking') : 'Loading'
    } else if (contractMessage) {
      bgClass = 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/30'
      borderClass = 'border-red-300/60 dark:border-red-600/40'
      textClass = 'text-red-700 dark:text-red-300'
      text = contractMessage
    } else {
      bgClass = 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/30'
      borderClass = 'border-emerald-300/60 dark:border-emerald-600/40'
      textClass = 'text-emerald-700 dark:text-emerald-300'
      text = statusT ? statusT('familyTree.status.badge.ok') : 'OK'
    }

    return (
      <span className={`inline-flex items-center px-1.5 py-0 rounded-full border text-[10px] font-semibold shadow-sm backdrop-blur-sm ${bgClass} ${borderClass} ${textClass}`}>
        {text}
      </span>
    )
  }

  return (
    <div className="text-sm text-slate-600 dark:text-slate-300 p-6">
      {/* Mobile-responsive header layout */}
      <div className="mb-6">
        {/* Header with title and edit buttons - always on same row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Left side: Title */}
          <div className="min-w-0 flex-1">
            <span className="text-lg font-bold text-transparent bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 dark:from-slate-200 dark:via-blue-400 dark:to-purple-400 bg-clip-text">
              {t('familyTree.ui.contractModeConfig')}
            </span>
          </div>

          {/* Right side: Edit/Save/Cancel Buttons - always in top right */}
          <div className="flex-shrink-0">
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={resetToDefaults}
                  className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                  title={t('familyTree.config.resetToDefaults')}
                >{t('familyTree.config.reset')}</button>
                <button
                  onClick={applyConfigChanges}
                  disabled={!hasDiff}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 font-semibold ${hasDiff ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md hover:shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                >{t('familyTree.ui.save')}</button>
                <button onClick={cancel} className="px-3 py-1.5 text-xs rounded-lg bg-slate-600 dark:bg-slate-500 text-white hover:bg-slate-700 dark:hover:bg-slate-600 transition-all duration-200 shadow-md hover:shadow-lg font-semibold">{t('familyTree.ui.cancel')}</button>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold">{t('familyTree.ui.edit')}</button>
            )}
          </div>
        </div>

        {/* Status Badge and Action Buttons Row - only show in non-editing mode */}
        {!editing && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: Status Badge */}
            <div className="flex items-center">
              {getStatusBadge()}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="inline-flex items-center justify-center h-6 px-2 gap-1 rounded-md border border-slate-300/60 dark:border-slate-600/60 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700/80 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:focus-visible:ring-blue-400/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm group flex-shrink-0 text-xs whitespace-nowrap"
                  disabled={loading}
                  title={statusT ? statusT('familyTree.actions.refresh') : 'Refresh'}
                  aria-label={statusT ? statusT('familyTree.actions.refresh') : 'Refresh'}
                >
                  <svg className={`w-3 h-3 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300 flex-shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                  <span className="truncate">{statusT ? statusT('familyTree.actions.refresh') : 'Refresh'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => { clearAllCaches(); }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-semibold transition-all duration-200 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-200 hover:border-rose-300 hover:text-rose-800 dark:hover:bg-rose-800/40 dark:hover:border-rose-600 dark:hover:text-rose-200 hover:shadow-md active:bg-rose-300 dark:active:bg-rose-700/50 shadow-sm flex-shrink-0 whitespace-nowrap"
              >
                <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                <span className="truncate">{t('familyTree.config.clearAndRefresh', 'Clear')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          {/* RPC and Contract in same row */}
          <div className="flex flex-col lg:flex-row lg:gap-4 gap-4">
            <div className="flex-1">
              <label className="block text-slate-700 dark:text-slate-300 mb-2 font-semibold">{t('familyTree.config.rpc')}:</label>
              <input type="text" value={localRpcUrl} onChange={e => setLocalRpcUrl(e.target.value)} className={`w-full px-3 py-2 text-sm font-mono rounded-md border bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 backdrop-blur-sm shadow-sm ${errors.rpc ? 'border-red-400 focus:border-red-500 focus:ring-red-500/60 dark:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/60 dark:focus:border-blue-400 dark:focus:ring-blue-400/60 hover:border-blue-400 dark:hover:border-blue-500'}`} />
              {errors.rpc && <div className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{t(errors.rpc, 'RPC format error')}</div>}
            </div>
            <div className="flex-1">
              <label className="block text-slate-700 dark:text-slate-300 mb-2 font-semibold">{t('familyTree.config.contract')}:</label>
              <input type="text" value={localContractAddress} onChange={e => setLocalContractAddress(e.target.value)} className={`w-full px-3 py-2 text-sm font-mono rounded-md border bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 backdrop-blur-sm shadow-sm ${errors.contract ? 'border-red-400 focus:border-red-500 focus:ring-red-500/60 dark:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/60 dark:focus:border-blue-400 dark:focus:ring-blue-400/60 hover:border-blue-400 dark:hover:border-blue-500'}`} />
              {errors.contract && <div className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{t(errors.contract, 'Contract address format error')}</div>}
            </div>
          </div>
          {/* Root Hash and Version in same row */}
          <div className="flex flex-col lg:flex-row lg:gap-4 gap-4">
            <div className="flex-1">
              <label className="block text-slate-700 dark:text-slate-300 mb-2 font-semibold">{t('familyTree.config.root')}:</label>
              <input type="text" value={localRootHash} onChange={e => setLocalRootHash(e.target.value)} className={`w-full px-3 py-2 text-sm font-mono rounded-md border bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 backdrop-blur-sm shadow-sm ${errors.root ? 'border-red-400 focus:border-red-500 focus:ring-red-500/60 dark:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/60 dark:focus:border-blue-400 dark:focus:ring-blue-400/60 hover:border-blue-400 dark:hover:border-blue-500'}`} />
              {errors.root && <div className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{t(errors.root, 'Root Hash format error')}</div>}
            </div>
            <div className="lg:min-w-32">
              <label className="block text-slate-700 dark:text-slate-300 mb-2 font-semibold">{t('familyTree.ui.versionNumber')}:</label>
              <div className="inline-flex items-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm h-[38px]">
                <button
                  className="w-8 h-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-l-md transition-colors duration-150 text-sm font-medium"
                  onClick={() => setLocalVersion(v => Math.max(1, (v || 1) - 1))}
                  aria-label="Decrease version"
                >-</button>
                <input
                  type="number"
                  min={1}
                  value={localVersion}
                  onChange={e => setLocalVersion(Math.max(1, Number(e.target.value)))}
                  className="w-24 h-full text-sm text-center border-0 border-l border-r border-slate-300 dark:border-slate-600 bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-0 font-medium"
                />
                <button
                  className="w-8 h-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-r-md transition-colors duration-150 text-sm font-medium"
                  onClick={() => setLocalVersion(v => (v || 1) + 1)}
                  aria-label="Increase version"
                >+</button>
              </div>
            </div>
          </div>
          {rootHistory.length > 0 && (
            <div className="mt-2">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t('familyTree.config.rootHistory', 'Root hash history')}
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {rootHistory.map(h => (
                  <div key={h} className="inline-flex items-center gap-1 max-w-full">
                    <button
                      type="button"
                      onClick={() => setLocalRootHash(h)}
                      className="px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-600 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-150 font-mono text-[11px] shadow-sm truncate max-w-[240px]"
                      title={h}
                    >{formatHashMiddle(h)}</button>
                    <button
                      type="button"
                      aria-label={t('familyTree.actions.remove', 'Remove')}
                      className="w-4 h-4 inline-flex items-center justify-center rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors duration-150"
                      onClick={() => removeRootFromHistory(h)}
                      title={t('familyTree.actions.remove', 'Remove') as string}
                    >×</button>
                  </div>
                ))}
              </div>
              <div className="mt-1">
                <button
                  type="button"
                  onClick={clearRootHistory}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 underline"
                >{t('familyTree.actions.clearAll', 'Clear all')}</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 text-slate-700 dark:text-slate-300">
          {/* RPC and Contract - responsive layout */}
          <div className="flex flex-col lg:flex-row lg:gap-6 gap-2">
            <div className="flex items-center gap-2 lg:flex-1 lg:min-w-0">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{t('familyTree.config.rpc')}:</span>
              <span className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all" title={rpcUrl}>{rpcUrl}</span>
            </div>
            <div className="flex items-center gap-2 lg:flex-shrink-0">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{t('familyTree.config.contract')}:</span>
              <div className="inline-flex items-center gap-1">
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap sm:whitespace-normal sm:break-all" title={contractAddress}>
                  <span className="inline sm:hidden">{shortAddress(contractAddress)}</span>
                  <span className="hidden sm:inline">{contractAddress}</span>
                </span>
                {contractAddress && (
                  <button
                    onClick={() => copy(contractAddress)}
                    aria-label={t('search.copy', 'Copy')}
                    className="shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    title={t('search.copy', 'Copy') as string}
                  >
                    <Clipboard size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact version controls - only show in non-editing mode */}
      {!editing && (
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
          {/* Root and Version - responsive layout */}
          <div className="flex flex-col lg:flex-row lg:gap-6 gap-2">
            <div className="flex items-center gap-2 lg:flex-1 lg:min-w-0">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{t('familyTree.config.root')}:</span>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1 max-w-full">
                  <span className="block overflow-hidden font-mono text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap sm:whitespace-normal sm:break-all" title={rootHash}>
                    <span className="inline sm:hidden">{formatHashMiddle(rootHash)}</span>
                    <span className="hidden sm:inline">{rootHash}</span>
                  </span>
                  {rootHash && (
                    <button
                      onClick={() => copy(rootHash)}
                      aria-label={t('search.copy', 'Copy')}
                      className="shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      title={t('search.copy', 'Copy') as string}
                    >
                      <Clipboard size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:flex-shrink-0">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{t('familyTree.ui.versionNumber')}:</span>
              <div className="inline-flex items-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm">
                <button
                  className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-l-md transition-colors duration-150 text-sm font-medium"
                  onClick={() => setLocalVersion(v => Math.max(1, (v || 1) - 1))}
                  aria-label="Decrease version"
                >-</button>
                <input
                  type="number"
                  min={1}
                  value={localVersion}
                  onChange={e => setLocalVersion(Math.max(1, Number(e.target.value)))}
                  onBlur={applyVersion}
                  onKeyDown={e => { if (e.key === 'Enter') applyVersion() }}
                  className="w-12 h-6 text-xs text-center border-0 border-l border-r border-slate-300 dark:border-slate-600 bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-0 font-medium"
                />
                <button
                  className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-r-md transition-colors duration-150 text-sm font-medium"
                  onClick={() => setLocalVersion(v => (v || 1) + 1)}
                  aria-label="Increase version"
                >+</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Divider and bottom controls - only show in non-editing mode */}
      {!editing && (
        <>
          <div className="border-t border-slate-200/60 dark:border-slate-700/60 mt-4"></div>

          {/* Bottom section with traversal on left and stats on right */}
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 mt-4 text-xs">
        {/* Left: Traversal controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <span className="hidden sm:block text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{statusT ? statusT('familyTree.ui.traversal') : 'Traversal'}:</span>
          <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
            <div className="relative group">
              <button type="button" aria-label={statusT ? statusT('familyTree.ui.traversalDFS') : 'DFS'} onClick={() => setTraversal('dfs')} className={`px-3 py-1.5 text-xs transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:focus-visible:ring-blue-400/60 font-medium rounded-l-lg ${traversal==='dfs' ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>DFS</button>
              <div className="pointer-events-none absolute -top-8 left-0 whitespace-nowrap rounded bg-slate-900/90 dark:bg-slate-950/90 text-white px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]">{statusT ? statusT('familyTree.ui.traversalDFS') : 'Depth First Search'}</div>
            </div>
            <div className="relative group border-l border-slate-300 dark:border-slate-600">
              <button type="button" aria-label={statusT ? statusT('familyTree.ui.traversalBFS') : 'BFS'} onClick={() => setTraversal('bfs')} className={`px-3 py-1.5 text-xs transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:focus-visible:ring-blue-400/60 font-medium rounded-r-lg ${traversal==='bfs' ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>BFS</button>
              <div className="pointer-events-none absolute -top-8 left-0 whitespace-nowrap rounded bg-slate-900/90 dark:bg-slate-950/90 text-white px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]">{statusT ? statusT('familyTree.ui.traversalBFS') : 'Breadth First Search'}</div>
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-1 sm:gap-2">
          {(() => {
            const createdDisplay = progress ? progress.created : (loading ? '…' : 0)
            const depthDisplay = progress ? progress.depth : (loading ? '…' : 0)
            return (
              <span className="text-xs px-3 sm:px-4 py-0.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-600/30 select-none inline-flex items-center gap-3 sm:gap-5 backdrop-blur-sm shadow-sm flex-shrink-0">
                <span className="inline-flex flex-col items-start gap-0">
                  <span className="text-[10px] leading-tight font-semibold text-blue-600 dark:text-blue-400">{statusT ? statusT('familyTree.ui.nodesLabelFull') : 'Nodes'}</span>
                  <span className="text-[10px] leading-tight font-mono tabular-nums text-blue-800 dark:text-blue-100 font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{createdDisplay}</span>
                </span>
                <span className="h-5 w-px bg-blue-300 dark:bg-blue-600" aria-hidden="true" />
                <span className="inline-flex flex-col items-start gap-0">
                  <span className="text-[10px] leading-tight font-semibold text-blue-600 dark:text-blue-400">{statusT ? statusT('familyTree.ui.depthLabelFull') : 'Depth'}</span>
                  <span className="text-[10px] leading-tight font-mono tabular-nums text-blue-800 dark:text-blue-100 font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{depthDisplay}</span>
                </span>
              </span>
            )
          })()}
        </div>
      </div>
        </>
      )}
    </div>
  )
}