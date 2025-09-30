import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import FamilyTreeConfigForm from '../components/FamilyTreeConfigForm'
import ViewContainer from '../components/ViewContainer'
import { useTreeData } from '../context/TreeDataContext'
import { useVizOptions } from '../context/VizOptionsContext'
import { useConfig } from '../context/ConfigContext'

export default function TreePage() {
  const { traversal, includeVersionDetails, setTraversal, setIncludeVersionDetails } = useVizOptions()
  const { strictCacheOnly, update } = useConfig()
  const [viewMode, setViewMode] = useState<'dag' | 'tree' | 'force' | 'virtual'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('df:viewMode')
      if (saved === 'dag' || saved === 'tree' || saved === 'force' || saved === 'virtual') return saved as any
    }
    return 'tree'
  })
  const [editingConfig, setEditingConfig] = useState(false)

  const { t } = useTranslation()
  const { root, loading: loadingContract, progress, contractMessage, refresh, errors } = useTreeData()
  const SHOW_DEBUG = (import.meta as any).env.VITE_SHOW_DEBUG === '1'

  const triggerRefresh = useCallback(() => refresh(), [refresh])
  useEffect(() => { triggerRefresh() }, [triggerRefresh])

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('df:viewMode', viewMode) }, [viewMode])

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100 overflow-visible pb-4 md:pb-0">
      {SHOW_DEBUG && errors.length > 0 && (
        <div className="text-xs rounded border border-amber-300 dark:border-amber-600/60 bg-amber-50 dark:bg-amber-900/30 p-2 space-y-1">
          <div className="font-medium text-amber-700 dark:text-amber-300">Debug Errors ({errors.length})</div>
          {errors.slice(-5).map(e => (
            <div key={e.id} className="text-amber-800 dark:text-amber-200 break-all">
              <span className="font-semibold">[{e.context?.stage||'unknown'}]</span> {e.message}
            </div>
          ))}
        </div>
      )}
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/30 shadow-lg overflow-hidden">
        <FamilyTreeConfigForm 
          editing={editingConfig} 
          setEditing={setEditingConfig}
          contractMessage={contractMessage}
          loading={loadingContract}
          onRefresh={triggerRefresh}
          t={t as any}
        />
      </div>
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/30 shadow-lg overflow-visible">
        <div className="space-y-4 overflow-visible">
          {/* First Row: Title and Stats */}
          <div className="flex flex-row flex-wrap items-center justify-between gap-2 w-full">
            <h3 className="text-lg font-bold text-transparent bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text flex-shrink-0 min-w-0 break-words">
              {t('familyTree.ui.displaySettings')}
            </h3>
            {(() => {
              const createdDisplay = progress ? progress.created : (loadingContract ? '…' : 0)
              const depthDisplay = progress ? progress.depth : (loadingContract ? '…' : 0)
              return (
                <span className="text-xs px-4 py-0.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-600/30 select-none inline-flex items-center gap-5 backdrop-blur-sm shadow-sm flex-shrink-0">
                  <span className="inline-flex flex-col items-start gap-0">
                    <span className="text-[10px] leading-tight font-semibold text-blue-600 dark:text-blue-400">{t('familyTree.ui.nodesLabelFull')}</span>
                    <span className="text-[10px] leading-tight font-mono tabular-nums text-blue-800 dark:text-blue-100 font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{createdDisplay}</span>
                  </span>
                  <span className="h-5 w-px bg-blue-300 dark:bg-blue-600" aria-hidden="true" />
                  <span className="inline-flex flex-col items-start gap-0">
                    <span className="text-[10px] leading-tight font-semibold text-blue-600 dark:text-blue-400">{t('familyTree.ui.depthLabelFull')}</span>
                    <span className="text-[10px] leading-tight font-mono tabular-nums text-blue-800 dark:text-blue-100 font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>{depthDisplay}</span>
                  </span>
                </span>
              )
            })()}
          </div>
          
          {/* Second Row: Contract Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs overflow-visible">
            <div className="flex items-center gap-1.5 flex-shrink-0 overflow-visible">
              <div className="inline-flex rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-visible">
                <div className="relative group">
                  <button type="button" aria-label={t('familyTree.config.strictCacheOff')} onClick={() => update({ strictCacheOnly: false })} className={`px-1.5 py-0.5 text-[10px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:focus-visible:ring-blue-400/60 font-medium rounded-l ${!strictCacheOnly ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{t('familyTree.config.strictCacheOff')}</button>
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900/90 dark:bg-slate-950/90 text-white px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]">{t('familyTree.config.strictCacheOff')}</div>
                </div>
                <div className="relative group border-l border-slate-300 dark:border-slate-600">
                  <button type="button" aria-label={t('familyTree.config.strictCacheOn')} onClick={() => update({ strictCacheOnly: true })} className={`px-1.5 py-0.5 text-[10px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:focus-visible:ring-blue-400/60 font-medium rounded-r ${strictCacheOnly ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{t('familyTree.config.strictCacheOn')}</button>
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900/90 dark:bg-slate-950/90 text-white px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]">{t('familyTree.config.strictCacheOn')}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 overflow-visible">
              <div className="inline-flex rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-visible">
                <div className="relative group">
                  <button type="button" aria-label={t('familyTree.ui.traversalDFS')} onClick={() => setTraversal('dfs')} className={`px-1.5 py-0.5 text-[10px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:focus-visible:ring-blue-400/60 font-medium rounded-l ${traversal==='dfs' ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>DFS</button>
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900/90 dark:bg-slate-950/90 text-white px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]">{t('familyTree.ui.traversalDFS')}</div>
                </div>
                <div className="relative group border-l border-slate-300 dark:border-slate-600">
                  <button type="button" aria-label={t('familyTree.ui.traversalBFS')} onClick={() => setTraversal('bfs')} className={`px-1.5 py-0.5 text-[10px] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:focus-visible:ring-blue-400/60 font-medium rounded-r ${traversal==='bfs' ? 'bg-blue-600 text-white' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>BFS</button>
                  <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900/90 dark:bg-slate-950/90 text-white px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]">{t('familyTree.ui.traversalBFS')}</div>
                </div>
              </div>
            </div>
            <div className="relative group flex items-center gap-1 cursor-pointer select-none flex-shrink-0">
              <input type="checkbox" id="includeVersionDetailsToggle" className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 cursor-pointer bg-white dark:bg-slate-800 focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/60 dark:focus-visible:ring-blue-400/60 text-blue-600 dark:text-blue-400" checked={includeVersionDetails} onChange={e => setIncludeVersionDetails(e.target.checked)} aria-describedby="includeVersionDetailsHint" />
              <label htmlFor="includeVersionDetailsToggle" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer font-medium">{t('familyTree.ui.includeVersionDetails')}</label>
              <div id="includeVersionDetailsHint" className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900/90 dark:bg-slate-950/90 text-white px-2 py-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999]">{t('familyTree.ui.includeVersionDetailsDesc')}</div>
            </div>
          </div>
        </div>
      </div>
      <ViewContainer
        viewMode={viewMode as any}
        root={root}
        contractMessage={contractMessage}
        loading={loadingContract}
        onViewModeChange={setViewMode}
        viewModeLabels={{ tree: t('familyTree.viewModes.tree'), dag: t('familyTree.viewModes.dag'), force: t('familyTree.viewModes.force'), virtual: t('familyTree.viewModes.virtual') }}
      />
    </div>
  )
}
