import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import FamilyTreeConfigForm from '../components/FamilyTreeConfigForm'
import ViewContainer from '../components/ViewContainer'
import { useTreeData } from '../context/TreeDataContext'
import { useVizOptions } from '../context/VizOptionsContext'
export default function TreePage() {
  const { traversal, setTraversal } = useVizOptions()
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
    <div className="space-y-6 text-gray-900 dark:text-gray-100 overflow-visible pb-4 md:pb-0 w-full max-w-full">
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
          traversal={traversal}
          setTraversal={setTraversal}
          progress={progress}
        />
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
