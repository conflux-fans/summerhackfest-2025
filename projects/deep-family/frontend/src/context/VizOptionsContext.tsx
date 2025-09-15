import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'

export interface VizOptionsContextValue {
  traversal: 'dfs' | 'bfs'
  includeVersionDetails: boolean
  setTraversal: (t: 'dfs' | 'bfs') => void
  setIncludeVersionDetails: (v: boolean) => void
}

const VizOptionsContext = createContext<VizOptionsContextValue | null>(null)

const LS_KEYS = {
  traversal: 'df:traversal',
  includeVersionDetails: 'df:includeVersionDetails'
}

export function VizOptionsProvider({ children }: { children: React.ReactNode }) {
  const [traversal, setTraversal] = useState<'dfs' | 'bfs'>(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem(LS_KEYS.traversal)
      if (v === 'dfs' || v === 'bfs') return v
    }
    return 'dfs'
  })
  const [includeVersionDetails, setIncludeVersionDetails] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LS_KEYS.includeVersionDetails) === '0' ? false : true
    }
    return true
  })

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LS_KEYS.traversal, traversal) }, [traversal])
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem(LS_KEYS.includeVersionDetails, includeVersionDetails ? '1' : '0') }, [includeVersionDetails])

  const value = useMemo<VizOptionsContextValue>(() => ({
    traversal,
    includeVersionDetails,
    setTraversal,
    setIncludeVersionDetails
  }), [traversal, includeVersionDetails])

  return <VizOptionsContext.Provider value={value}>{children}</VizOptionsContext.Provider>
}

export function useVizOptions() {
  const ctx = useContext(VizOptionsContext)
  if (!ctx) throw new Error('useVizOptions must be used within VizOptionsProvider')
  return ctx
}
