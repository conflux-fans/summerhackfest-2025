import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'

export interface VizOptionsContextValue {
  traversal: 'dfs' | 'bfs'
  includeVersionDetails: boolean
  setTraversal: (t: 'dfs' | 'bfs') => void
}

const VizOptionsContext = createContext<VizOptionsContextValue | null>(null)

const LS_KEYS = {
  traversal: 'df:traversal'
}

export function VizOptionsProvider({ children }: { children: React.ReactNode }) {
  const [traversal, setTraversal] = useState<'dfs' | 'bfs'>(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem(LS_KEYS.traversal)
      if (v === 'dfs' || v === 'bfs') return v
    }
    return 'dfs'
  })

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LS_KEYS.traversal, traversal) }, [traversal])

  const value = useMemo<VizOptionsContextValue>(() => ({
    traversal,
    includeVersionDetails: true,
    setTraversal
  }), [traversal])

  return <VizOptionsContext.Provider value={value}>{children}</VizOptionsContext.Provider>
}

export function useVizOptions() {
  const ctx = useContext(VizOptionsContext)
  if (!ctx) throw new Error('useVizOptions must be used within VizOptionsProvider')
  return ctx
}
