import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'

type ConfigValues = {
  rpcUrl: string
  contractAddress: string
  rootHash: string
  rootVersionIndex: number
  strictCacheOnly: boolean
}

export type AppConfig = ConfigValues & {
  update: (partial: Partial<ConfigValues>) => void
  reset: () => void
  defaults: ConfigValues
  rootHistory: string[]
  addRootToHistory: (hash: string) => void
  removeRootFromHistory: (hash: string) => void
  clearRootHistory: () => void
}

const STORAGE_KEY = 'ft:config'
const ROOT_HISTORY_KEY = 'ft:rootHistory'
const ConfigContext = createContext<AppConfig | null>(null)

function getEnvDefaults(): ConfigValues {
  const rvRaw = (import.meta as any).env.VITE_ROOT_VERSION_INDEX
  let rv = Number(rvRaw)
  if (!Number.isFinite(rv) || rv < 1) rv = 1
  return {
    rpcUrl: (import.meta as any).env.VITE_RPC_URL,
    contractAddress: (import.meta as any).env.VITE_CONTRACT_ADDRESS,
    rootHash: (import.meta as any).env.VITE_ROOT_PERSON_HASH,
    rootVersionIndex: rv,
    strictCacheOnly: String((import.meta as any).env.VITE_STRICT_CACHE_ONLY || '').toLowerCase() === 'true' || String((import.meta as any).env.VITE_STRICT_CACHE_ONLY || '').toLowerCase() === '1',
  }
}

function loadStoredConfig(): Partial<ConfigValues> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as Partial<ConfigValues> : null
  } catch {
    return null
  }
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const defaults = useMemo(() => getEnvDefaults(), [])
  const [state, setState] = useState<ConfigValues>(() => ({
    ...defaults,
    ...(loadStoredConfig() || {}),
  }))
  const [rootHistory, setRootHistory] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(ROOT_HISTORY_KEY)
      const arr = raw ? JSON.parse(raw) as string[] : []
      const safeArr = Array.isArray(arr) ? arr.filter(v => typeof v === 'string') : []
      // Ensure initial default/stored rootHash is included at first load
      const storedCfg = (() => { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) as Partial<ConfigValues> : null } catch { return null } })()
      const initialRoot = (storedCfg?.rootHash && typeof storedCfg.rootHash === 'string' ? storedCfg.rootHash : getEnvDefaults().rootHash)
      if (typeof initialRoot === 'string' && /^0x[a-fA-F0-9]{64}$/.test(initialRoot.trim())) {
        const normalized = initialRoot.trim()
        if (!safeArr.some(h => h.toLowerCase() === normalized.toLowerCase())) {
          return [normalized, ...safeArr].slice(0, 20)
        }
      }
      return safeArr
    } catch { return [] }
  })

  // Persist computed initial history (including default root) once on mount
  useEffect(() => {
    try { localStorage.setItem(ROOT_HISTORY_KEY, JSON.stringify(rootHistory)) } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveRootHistory = (list: string[]) => {
    try { localStorage.setItem(ROOT_HISTORY_KEY, JSON.stringify(list)) } catch {}
  }

  const addRootToHistory = (hash: string) => {
    const normalized = (hash || '').trim()
    if (!/^0x[a-fA-F0-9]{64}$/.test(normalized)) return
    setRootHistory(prev => {
      const next = [normalized, ...prev.filter(v => v.toLowerCase() !== normalized.toLowerCase())].slice(0, 20)
      saveRootHistory(next)
      return next
    })
  }

  const removeRootFromHistory = (hash: string) => {
    setRootHistory(prev => {
      const next = prev.filter(v => v.toLowerCase() !== (hash || '').toLowerCase())
      saveRootHistory(next)
      return next
    })
  }

  const clearRootHistory = () => {
    setRootHistory([])
    saveRootHistory([])
  }

  const update = (partial: Partial<ConfigValues>) => {
    setState(prev => {
      const next = { ...prev, ...partial }
      try {
        const { rpcUrl, contractAddress, rootHash, rootVersionIndex, strictCacheOnly } = next
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ rpcUrl, contractAddress, rootHash, rootVersionIndex, strictCacheOnly }))
        if (partial.rootHash && /^0x[a-fA-F0-9]{64}$/.test(partial.rootHash.trim())) {
          // also record root history globally
          const normalized = partial.rootHash.trim()
          const currentRaw = localStorage.getItem(ROOT_HISTORY_KEY)
          let current: string[] = []
          try { current = currentRaw ? JSON.parse(currentRaw) as string[] : [] } catch { current = [] }
          const nextList = [normalized, ...current.filter(v => v.toLowerCase() !== normalized.toLowerCase())].slice(0, 20)
          try { localStorage.setItem(ROOT_HISTORY_KEY, JSON.stringify(nextList)) } catch {}
          // reflect in state
          setRootHistory(nextList)
        }
      } catch {}
      return next
    })
  }

  const reset = () => {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    setState(getEnvDefaults())
  }

  const value = useMemo<AppConfig>(() => ({
    ...state,
    update,
    reset,
    defaults,
    rootHistory,
    addRootToHistory,
    removeRootFromHistory,
    clearRootHistory,
  }), [state, defaults, rootHistory])

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider')
  return ctx
}
