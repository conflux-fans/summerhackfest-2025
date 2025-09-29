import { useTreeData } from '../context/TreeDataContext'
import { useMemo } from 'react'
import type { NodeData } from '../types/graph'
import { isMinted } from '../types/graph'

/**
 * useNodeData
 */
export function useNodeData(id: string | undefined | null): NodeData | undefined {
  const { nodesData } = useTreeData()
  return id ? nodesData[id] : undefined
}

/**
 * useNodeMeta
 */
export function useNodeMeta(id: string | undefined | null) {
  const nd = useNodeData(id)
  return useMemo(() => ({
    data: nd,
    minted: isMinted(nd),
    fullName: nd?.fullName,
    endorsementCount: nd?.endorsementCount,
    tag: nd?.tag,
  }), [nd])
}
