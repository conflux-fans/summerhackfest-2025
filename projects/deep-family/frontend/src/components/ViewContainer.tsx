import React, { Suspense } from 'react'
import LoadingSkeleton from './LoadingSkeleton'
import ViewModeSwitch from './ViewModeSwitch'
import type { GraphNode } from '../types/graph'
import { VirtualizedContractTree } from './FamilyTree'
import { NodeDetailProvider } from '../context/NodeDetailContext'
import { useTreeData } from '../context/TreeDataContext'
import { LAYOUT, useFamilyTreeHeight } from '../constants/layout'

const ForceDAGView = React.lazy(() => import('./ForceDAGView'))
const FlexibleDAGView = React.lazy(() => import('./FlexibleDAGView'))
const MerkleTreeView = React.lazy(() => import('./MerkleTreeView'))

interface ViewContainerProps {
  viewMode: 'dag' | 'tree' | 'force' | 'virtual'
  root: GraphNode | null
  contractMessage: string
  loading: boolean
  skeletonLines?: number
  onViewModeChange?: (mode: 'dag' | 'tree' | 'force' | 'virtual') => void
  viewModeLabels?: { tree: string; dag: string; force: string; virtual: string }
}

export default function ViewContainer({ viewMode, root, contractMessage, loading, onViewModeChange, viewModeLabels }: ViewContainerProps) {
  const hasRoot = !!root
  const { nodesData } = useTreeData()
  const responsiveHeight = useFamilyTreeHeight()
  // useVizOptions internally inside views / contexts
  const content = (
    <Suspense fallback={<LoadingSkeleton />}> {
      hasRoot ? (
        viewMode === 'force' ? <ForceDAGView root={root as GraphNode} />
        : viewMode === 'dag' ? <FlexibleDAGView root={root as GraphNode} />
        : viewMode === 'tree' ? <MerkleTreeView root={root as GraphNode} />
        : <VirtualizedContractTree root={root as GraphNode} height={responsiveHeight} rowHeight={LAYOUT.ROW_HEIGHT} />
      ) : (
        <div className="w-full bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-900/90 dark:via-slate-800/60 dark:to-slate-900/90 rounded-2xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 shadow-xl backdrop-blur-sm p-4 pt-16 flex items-center justify-center" style={{ minHeight: responsiveHeight }}>
          {loading ? <LoadingSkeleton /> : contractMessage ? <div className="text-sm text-slate-700 dark:text-slate-300">{contractMessage}</div> : <LoadingSkeleton />}
        </div>
      )
    } </Suspense>
  )
  return (
    <div className="w-full transition-colors relative">
      {/* Floating View Mode Switch - positioned above zoom controls */}
      {onViewModeChange && viewModeLabels && (
        <div className="absolute top-4 right-3 z-50">
          <ViewModeSwitch 
            value={viewMode} 
            onChange={onViewModeChange} 
            labels={viewModeLabels}
          />
        </div>
      )}
      
      <NodeDetailProvider>
        <Suspense fallback={<LoadingSkeleton />}>{content}</Suspense>
      </NodeDetailProvider>
    </div>
  )
}
