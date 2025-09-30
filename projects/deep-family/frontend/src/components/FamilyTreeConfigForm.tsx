import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useConfig } from '../context/ConfigContext'
import { useDebounce } from '../hooks/useDebounce'
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
}

export default function FamilyTreeConfigForm({ editing, setEditing, contractMessage, loading, onRefresh, t: statusT }: Props) {
  const { t } = useTranslation()
  const { rpcUrl, contractAddress, rootHash, rootVersionIndex, update, rootHistory, removeRootFromHistory, clearRootHistory } = useConfig()
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
    localRootHash !== rootHash
  )

  const applyConfigChanges = () => {
    if (!validateAll()) return
    update({
      rpcUrl: localRpcUrl,
      contractAddress: localContractAddress,
      rootHash: localRootHash,
    })
    setEditing(false)
    // Proactively refresh after saving config
    onRefresh?.()
  }

  const cancel = () => {
    setLocalRpcUrl(rpcUrl)
    setLocalContractAddress(contractAddress)
    setLocalRootHash(rootHash)
    setEditing(false)
  }

  // debounce version apply on blur or enter
  const applyVersion = () => {
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

  // debounce version change (auto apply after 600ms idle)
  useDebounce(localVersion, 600, v => { if (v !== rootVersionIndex) applyVersion() })

  // Status badge logic
  const colorMap: Record<string, string> = {
    checking: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-amber-300/60 dark:from-amber-900/40 dark:to-orange-900/30 dark:text-amber-300 dark:border-amber-600/40 shadow-sm backdrop-blur-sm',
    ok: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-300/60 dark:from-emerald-900/40 dark:to-green-900/30 dark:text-emerald-300 dark:border-emerald-600/40 shadow-sm backdrop-blur-sm',
    root_missing: 'bg-gradient-to-r from-rose-100 to-red-100 text-rose-700 border-rose-300/60 dark:from-rose-900/40 dark:to-red-900/30 dark:text-rose-300 dark:border-rose-600/40 shadow-sm backdrop-blur-sm',
    error: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-300/60 dark:from-red-900/40 dark:to-rose-900/30 dark:text-red-300 dark:border-red-600/40 shadow-sm backdrop-blur-sm'
  }

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
      <span className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-semibold shadow-sm backdrop-blur-sm ${bgClass} ${borderClass} ${textClass}`}>
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
        
        {/* Status Badge and Refresh Button Row */}
        <div className="flex flex-wrap items-center gap-3">
          {getStatusBadge()}
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
            onClick={() => { clearAllCaches(); onRefresh?.() }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-semibold transition-all duration-200 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-200 hover:border-rose-300 hover:text-rose-800 dark:hover:bg-rose-800/40 dark:hover:border-rose-600 dark:hover:text-rose-200 hover:shadow-md active:bg-rose-300 dark:active:bg-rose-700/50 shadow-sm flex-shrink-0 whitespace-nowrap"
          >
            <span className="truncate">{t('familyTree.config.clearAndRefresh', 'Clear Cache and Refresh')}</span>
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-2 font-semibold">{t('familyTree.config.rpc')}:</label>
            <input type="text" value={localRpcUrl} onChange={e => setLocalRpcUrl(e.target.value)} className={`w-full px-4 py-3 text-base sm:text-sm font-mono rounded-lg border bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 backdrop-blur-sm shadow-sm ${errors.rpc ? 'border-red-400 focus:border-red-500 focus:ring-red-500/60 dark:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/60 dark:focus:border-blue-400 dark:focus:ring-blue-400/60 hover:border-blue-400 dark:hover:border-blue-500'}`} />
            {errors.rpc && <div className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{t(errors.rpc, 'RPC format error')}</div>}
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-2 font-semibold">{t('familyTree.config.contract')}:</label>
            <input type="text" value={localContractAddress} onChange={e => setLocalContractAddress(e.target.value)} className={`w-full px-4 py-3 text-base sm:text-sm font-mono rounded-lg border bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 backdrop-blur-sm shadow-sm ${errors.contract ? 'border-red-400 focus:border-red-500 focus:ring-red-500/60 dark:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/60 dark:focus:border-blue-400 dark:focus:ring-blue-400/60 hover:border-blue-400 dark:hover:border-blue-500'}`} />
            {errors.contract && <div className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{t(errors.contract, 'Contract address format error')}</div>}
          </div>
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-2 font-semibold">{t('familyTree.config.root')}:</label>
            <input type="text" value={localRootHash} onChange={e => setLocalRootHash(e.target.value)} className={`w-full px-4 py-3 text-base sm:text-sm font-mono rounded-lg border bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 backdrop-blur-sm shadow-sm ${errors.root ? 'border-red-400 focus:border-red-500 focus:ring-red-500/60 dark:border-red-500' : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/60 dark:focus:border-blue-400 dark:focus:ring-blue-400/60 hover:border-blue-400 dark:hover:border-blue-500'}`} />
            {errors.root && <div className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{t(errors.root, 'Root Hash format error')}</div>}
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
        </div>
      ) : (
        <div className="space-y-2 text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{t('familyTree.config.rpc')}:</span>
            <span className="font-mono text-xs text-blue-600 dark:text-blue-400 break-all" title={rpcUrl}>{rpcUrl}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{t('familyTree.config.contract')}:</span>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1 max-w-full">
                <span className="block overflow-hidden font-mono text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap sm:whitespace-normal sm:break-all" title={contractAddress}>
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

      {/* Compact version controls */}
      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
        <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-2">
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
  )
}
