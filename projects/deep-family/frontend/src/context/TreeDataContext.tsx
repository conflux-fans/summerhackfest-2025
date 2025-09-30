import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useConfig } from './ConfigContext'
import { useTranslation } from 'react-i18next'
import type { GraphNode } from '../types/graph'
import { makeNodeId } from '../types/graph'
import DeepFamily from '../abi/DeepFamily.json'
import { ethers } from 'ethers'
import { makeProvider } from '../utils/provider'
import { fetchSubtreeStream } from '../components/FamilyTree'
import { getRuntimeFamilyTreeConfig } from '../config/familyTreeConfig'
import { useErrorMonitor } from '../hooks/useErrorMonitor'
import { useVizOptions } from './VizOptionsContext'
import { NodeData } from '../types/graph'

// Reuse provider instances to avoid repeated network detection / socket exhaustion
const providerCache = new Map<string, ethers.JsonRpcProvider>()

export interface TreeProgress { created: number; visited: number; depth: number }
interface TreeDataValue {
  root: GraphNode | null
  loading: boolean
  progress?: TreeProgress
  contractMessage: string
  refresh: () => void
  errors: ReturnType<typeof useErrorMonitor>['errors']
  includeVersionDetails: boolean
  nodesData: Record<string, NodeData>
  setNodesData?: React.Dispatch<React.SetStateAction<Record<string, NodeData>>>
  getStoryData: (tokenId: string) => Promise<any>
  preloadStoryData: (tokenId: string) => void
  getNodeByTokenId: (tokenId: string) => Promise<NodeData | null>
  getOwnerOf: (tokenId: string) => Promise<string | null>
  clearAllCaches: () => void
}

const TreeDataContext = createContext<TreeDataValue | null>(null)

const MULTICALL_ABI = [
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) public returns (tuple(bool success, bytes returnData)[])'
]

export function TreeDataProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { rpcUrl, contractAddress, rootHash, rootVersionIndex, strictCacheOnly } = useConfig()
  const { traversal, includeVersionDetails } = useVizOptions()
  const [root, setRoot] = useState<GraphNode | null>(null)
  // Synchronous bootstrap for nodesData from localStorage (ensures details available even in strict mode on first paint)
  const initialNodesDataRef = useRef<Record<string, NodeData> | null>(null)
  if (initialNodesDataRef.current === null) {
    try {
      const ns = `df.cache.v1::${rpcUrl || 'no-rpc'}::${contractAddress || 'no-contract'}`
      const raw = localStorage.getItem(`${ns}::nodesData`)
      initialNodesDataRef.current = raw ? (JSON.parse(raw) as Record<string, NodeData>) : {}
    } catch { initialNodesDataRef.current = {} }
  }
  const [nodesData, setNodesData] = useState<Record<string, NodeData>>(() => initialNodesDataRef.current || {})
  const nodesDataRef = useRef(nodesData)
  useEffect(() => { nodesDataRef.current = nodesData }, [nodesData])
  // nodesDataRef keeps latest snapshot for async updates
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<TreeProgress | undefined>(undefined)
  const [contractMessage, setContractMessage] = useState('')
  const [refreshTick, setRefreshTick] = useState(0)
  const refresh = useCallback(() => setRefreshTick(t => t + 1), [])
  // Remove auto-refresh from context; pages should call refresh() explicitly when needed
  const { errors, push } = useErrorMonitor()
  const stageLoggedRef = useRef<Set<string>>(new Set())
  const [loadOptionsSnapshot, setLoadOptionsSnapshot] = useState({ includeVersionDetails })
  useEffect(() => {
    if (includeVersionDetails && !loadOptionsSnapshot.includeVersionDetails) {
      setLoadOptionsSnapshot(s => s.includeVersionDetails ? s : { ...s, includeVersionDetails: true })
    }
  }, [includeVersionDetails, loadOptionsSnapshot.includeVersionDetails])
  const optionsRef = useRef({ traversal })
  useEffect(() => { const o = optionsRef.current; if (o.traversal !== traversal) { o.traversal = traversal; refresh() } }, [traversal, refresh])

  // Provider + contract (memoized & cached)
  const provider = useMemo(() => {
    if (!rpcUrl) return null
    if (providerCache.has(rpcUrl)) return providerCache.get(rpcUrl) as ethers.JsonRpcProvider
    try {
      const p = makeProvider(rpcUrl)
      providerCache.set(rpcUrl, p)
      return p
    } catch { return null }
  }, [rpcUrl])

  const contract = useMemo(() => {
    if (!provider || !contractAddress) return null
    try { return new ethers.Contract(contractAddress, (DeepFamily as any).abi, provider) } catch { return null }
  }, [provider, contractAddress])

  const fetchRunKeyRef = useRef<string | null>(null)

  // Persistent storage namespace scoped by RPC + contract
  const storageNS = useMemo(() => {
    const rpc = rpcUrl || 'no-rpc'
    const addr = contractAddress || 'no-contract'
    return `df.cache.v1::${rpc}::${addr}`
  }, [rpcUrl, contractAddress])

  // Persisted familyTree root (scoped by RPC+contract+root params)
  const vizRootKey = useMemo(() => {
    const rh = rootHash || 'no-root'
    const rv = Number(rootVersionIndex) || 0
    return `${storageNS}::vizRoot::${rh}::${rv}`
  }, [storageNS, rootHash, rootVersionIndex])

  const persistNodesData = useCallback((data: Record<string, NodeData>) => {
    try { localStorage.setItem(`${storageNS}::nodesData`, JSON.stringify(data)) } catch {}
  }, [storageNS])

  // Load persisted caches when RPC/contract changes
  useEffect(() => {
    try {
      const rawNodes = localStorage.getItem(`${storageNS}::nodesData`)
      if (rawNodes) {
        const obj = JSON.parse(rawNodes) as Record<string, NodeData>
        setNodesData(obj)
      } else {
        setNodesData({})
      }
    } catch { setNodesData({}) }
  }, [storageNS])

  // Persist nodesData whenever it changes (after storageNS is available)
  useEffect(() => {
    persistNodesData(nodesData)
  }, [nodesData, persistNodesData])

  // Load persisted root tree first (scoped by rootHash+version). If no cache for current key, clear root to avoid stale display
  useEffect(() => {
    try {
      const raw = localStorage.getItem(vizRootKey)
      if (raw) {
        const obj = JSON.parse(raw) as GraphNode
        const matchesKey = (
          typeof rootHash === 'string' && obj?.personHash && obj.personHash.toLowerCase() === rootHash.toLowerCase() &&
          Number(obj?.versionIndex) === Number(rootVersionIndex)
        )
        if (matchesKey) {
          setRoot(obj)
        } else {
          // Stale or mis-keyed cache -> remove and clear
          try { localStorage.removeItem(vizRootKey) } catch {}
          setRoot(null)
        }
      } else {
        // No cache for this rootHash+version -> clear any previous root to prevent stale data
        setRoot(null)
      }
    } catch {
      /* ignore */
    }
  }, [vizRootKey, rootHash, rootVersionIndex])

  // Persist root tree whenever it changes (non-null)
  useEffect(() => {
    if (!root) return
    // Only persist when the in-memory root matches the current config (rootHash+version)
    const matchesCurrentConfig = (
      typeof rootHash === 'string' && rootHash.toLowerCase() === String(root.personHash || '').toLowerCase() &&
      Number(rootVersionIndex) === Number(root.versionIndex)
    )
    if (!matchesCurrentConfig) return
    try { localStorage.setItem(vizRootKey, JSON.stringify(root)) } catch {}
  }, [root, vizRootKey, rootHash, rootVersionIndex])

  // Hydrate nodesData from localStorage snapshot for nodes present in current root (no network)
  useEffect(() => {
    if (!root) return
    try {
      const raw = localStorage.getItem(`${storageNS}::nodesData`)
      if (!raw) return
      const snapshot = JSON.parse(raw) as Record<string, NodeData>
      const collectIds = (r: GraphNode | null): string[] => {
        if (!r) return []
        const acc: string[] = []
        const stack: GraphNode[] = [r]
        while (stack.length) {
          const n = stack.pop() as GraphNode
          acc.push(makeNodeId(n.personHash, Number(n.versionIndex)))
          if (n.children) for (const c of n.children) stack.push(c)
        }
        return acc
      }
      const ids = collectIds(root)
      if (!ids.length) return
      setNodesData(prev => {
        let changed = false
        const next = { ...prev }
        for (const id of ids) {
          const fromSnap = snapshot[id]
          if (!fromSnap) continue
          if (!next[id]) { next[id] = fromSnap; changed = true; continue }
          // Merge missing detailed fields without overwriting existing state
          const cur = next[id]
          const merged = { ...fromSnap, ...cur, id: cur.id }
          // Prefer fields already in memory; ensure tokenId/endorsement/name are restored
          const final = { ...fromSnap, ...cur, ...merged }
          // Shallow compare for minimal churn
          const before = JSON.stringify(cur)
          const after = JSON.stringify(final)
          if (before !== after) { next[id] = final as any; changed = true }
        }
        return changed ? next : prev
      })
    } catch {}
  }, [root, storageNS])

  // Root + base streaming load
  useEffect(() => {
    if (refreshTick === 0) return
    if (!contract) return
    // In strict cache mode, completely skip familyTree loading (avoid network access)
    if (strictCacheOnly) return
    
    // Check if we already have complete cached data (three-tier cache check)
    const hasMemoryCache = root && 
      typeof rootHash === 'string' && root.personHash.toLowerCase() === rootHash.toLowerCase() &&
      Number(root.versionIndex) === Number(rootVersionIndex)
    
    if (hasMemoryCache) {
      // Memory cache hit - no need to load
      return
    }
    
    // Check localStorage cache
    try {
      const raw = localStorage.getItem(vizRootKey)
      if (raw) {
        const cachedRoot = JSON.parse(raw) as GraphNode
        const matchesKey = (
          typeof rootHash === 'string' && cachedRoot?.personHash && 
          cachedRoot.personHash.toLowerCase() === rootHash.toLowerCase() &&
          Number(cachedRoot?.versionIndex) === Number(rootVersionIndex)
        )
        if (matchesKey) {
          // Local storage cache hit - accept cached root (even if children may be empty)
          // Root structure is persisted progressively during streaming; accepting it avoids
          // unnecessary network calls on reload when cache is already present.
          setRoot(cachedRoot)
          return
        }
      }
    } catch {}
    
    const runKey = `contract-${rootHash}-${rootVersionIndex}-${refreshTick}`
    if (fetchRunKeyRef.current === runKey) return
    fetchRunKeyRef.current = runKey
    let cancelled = false
    const controller = new AbortController()
    ;(async () => {
      // Validate root config before touching the contract or mutating caches
      const isValidHash = typeof rootHash === 'string' && /^0x[0-9a-fA-F]{64}$/.test(rootHash)
      const isValidVersion = Number.isFinite(rootVersionIndex) && Number(rootVersionIndex) >= 1
      if (!isValidHash || !isValidVersion) {
        // Do not clear nodesData/localStorage here; not entering familyTree mode
        if (!cancelled) setContractMessage(t('familyTree.status.rootNotFound'))
        return
      }
      // Only now that config is valid, enter familyTree loading state and clear prior viz state
      setLoading(true)
      setLoadOptionsSnapshot({ includeVersionDetails })
      setRoot(null)
      // Preserve existing nodesData cache to avoid blowing away PersonPage/story caches
      setContractMessage('')
      setProgress(undefined)
      // Preflight RPC availability (helps distinguish rate-limit/network early)
      try {
        await (provider as any)?.send?.('eth_chainId', [])
      } catch (e: any) {
        if (!cancelled) {
          const raw = String(
            e?.message || e?.shortMessage ||
            (e?.cause && (e.cause.message || e.cause.shortMessage)) || ''
          ) + ' ' + JSON.stringify({ code: e?.code, cause: e?.cause?.code, err: (e?.error && e.error.code), info: (e?.info && e.info.error && e.info.error.code) })
          const code = (e?.code ?? (e?.error && e.error.code) ?? (e?.info && e.info.error && e.info.error.code) ?? (e?.cause && e.cause.code)) as any
          const isRateLimit = (code === -32005) || /Too\s*many\s*requests|daily\s*request\s*count\s*exceeded|rate[-\s]?limit|status\s*429/i.test(raw)
          const isConnRefused = /ECONNREFUSED|ERR_CONNECTION_REFUSED|connection\s*refused/i.test(raw)
          const isAbort = /AbortError|The user aborted a request/i.test(raw)
          const isFetchFail = /Failed\s*to\s*fetch|NetworkError\s*when\s*attempting\s*to\s*fetch/i.test(raw)
          const isNetwork = isConnRefused || isAbort || isFetchFail || /network|timeout|ECONN|ENET|EAI_AGAIN/i.test(raw) || String(code).includes('NETWORK')
          if (isRateLimit) setContractMessage(t('familyTree.status.rateLimited'))
          else if (isNetwork) setContractMessage(t('familyTree.status.networkError'))
          else setContractMessage(t('familyTree.status.contractModeRootNotFound'))
        }
        setLoading(false)
        return
      }
      try { await contract.getVersionDetails(rootHash, rootVersionIndex) } catch (e: any) {
        if (!cancelled) {
          // Map common errors to clearer messages
          const msg = String(
            e?.message || e?.shortMessage ||
            (e?.cause && (e.cause.message || e.cause.shortMessage)) ||
            ''
          )
          const name = String((e as any)?.errorName || '')
          const code = (e?.code ?? (e?.error && e.error.code) ?? (e?.info && e.info.error && e.info.error.code) ?? (e?.cause && e.cause.code)) as any
          const isRateLimit = (code === -32005) || /Too\s*many\s*requests|daily\s*request\s*count\s*exceeded|rate[-\s]?limit|status\s*429/i.test(msg)
          const isConnRefused = /ECONNREFUSED|ERR_CONNECTION_REFUSED|connection\s*refused/i.test(msg)
          const isAbort = /AbortError|The user aborted a request/i.test(msg)
          const isFetchFail = /Failed\s*to\s*fetch|NetworkError\s*when\s*attempting\s*to\s*fetch/i.test(msg)
          const isNetwork = isConnRefused || isAbort || isFetchFail || /network|timeout|ECONN|ENET|EAI_AGAIN/i.test(msg) || String(code).includes('NETWORK')
          if (isRateLimit) {
            setContractMessage(t('familyTree.status.rateLimited'))
          } else if (name.includes('InvalidPersonHash') || name.includes('InvalidVersionIndex') || /InvalidPersonHash|InvalidVersionIndex/i.test(msg)) {
            setContractMessage(t('familyTree.status.rootNotFound'))
          } else if (isNetwork) {
            setContractMessage(t('familyTree.status.networkError'))
          } else {
            setContractMessage(t('familyTree.status.contractModeRootNotFound'))
          }
          if (!stageLoggedRef.current.has('root_check')) { stageLoggedRef.current.add('root_check'); push(e as any, { stage: 'root_check' }) }
        }
        setLoading(false)
        return
      }
      try {
        let rootNode: GraphNode | undefined
        let lastUpdate = performance.now()
        let emitted = 0
        const { traversal: trv } = optionsRef.current
        for await (const _ of fetchSubtreeStream(contract, rootHash, rootVersionIndex, {
          signal: controller.signal,
          traversal: trv,
          maxDepth: getRuntimeFamilyTreeConfig().DEFAULT_MAX_DEPTH,
          hardNodeLimit: getRuntimeFamilyTreeConfig().DEFAULT_HARD_NODE_LIMIT,
          onProgress: stats => { if (!cancelled) setProgress(stats) },
          onNode: n => {
            if (!rootNode) rootNode = n
            const id = makeNodeId(n.personHash, Number(n.versionIndex))
            setNodesData(prev => prev[id] ? prev : ({ ...prev, [id]: { personHash: n.personHash, versionIndex: Number(n.versionIndex), id, tag: n.tag } }))
          }
        })) {
          if (cancelled) break
          if (!rootNode) continue
          const now = performance.now()
            emitted++
          if (now - lastUpdate > 60 || emitted % 25 === 0) {
            setRoot(prev => {
              if (!prev) return rootNode ? { ...rootNode } : null
              // shallow compare child count & hash/version to skip redundant updates
              if (prev.personHash === rootNode!.personHash && prev.versionIndex === rootNode!.versionIndex && (prev.children?.length || 0) === (rootNode!.children?.length || 0)) return prev
              return { ...rootNode! }
            })
            lastUpdate = now
          }
        }
        if (!cancelled && rootNode) setRoot(prev => {
          const rn = rootNode as GraphNode
          if (!prev) return { ...rn }
          if (prev.personHash === rn.personHash && prev.versionIndex === rn.versionIndex && (prev.children?.length || 0) === (rn.children?.length || 0)) return prev
          return { ...rn }
        })
      } catch (e: any) {
        if (!cancelled && e?.name !== 'AbortError') {
          const raw = String(
            e?.message || e?.shortMessage ||
            (e?.cause && (e.cause.message || e.cause.shortMessage)) || ''
          ) + ' ' + JSON.stringify({ code: e?.code, cause: e?.cause?.code, err: (e?.error && e.error.code), info: (e?.info && e.info.error && e.info.error.code) })
          const code = (e?.code ?? (e?.error && e.error.code) ?? (e?.info && e.info.error && e.info.error.code) ?? (e?.cause && e.cause.code)) as any
          const isRateLimit = (code === -32005) || /Too\s*many\s*requests|daily\s*request\s*count\s*exceeded|rate[-\s]?limit|status\s*429/i.test(raw)
          const isConnRefused = /ECONNREFUSED|ERR_CONNECTION_REFUSED|connection\s*refused/i.test(raw)
          const isAbort = /AbortError|The user aborted a request/i.test(raw)
          const isFetchFail = /Failed\s*to\s*fetch|NetworkError\s*when\s*attempting\s*to\s*fetch/i.test(raw)
          const isNetwork = isConnRefused || isAbort || isFetchFail || /network|timeout|ECONN|ENET|EAI_AGAIN/i.test(raw) || String(code).includes('NETWORK')
          // Don't downgrade an existing rateLimited message
          setContractMessage(prev => {
            if (prev && /rate/i.test(prev)) return prev
            if (isRateLimit) return t('familyTree.status.rateLimited')
            if (isNetwork) return t('familyTree.status.networkError')
            return e.message || 'error'
          })
          push(e, { stage: 'stream_fetch' })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { 
      cancelled = true 
      controller.abort() 
      setLoading(l => l ? false : l)
    }
  }, [contract, rootHash, rootVersionIndex, refreshTick, traversal, t, push, includeVersionDetails, strictCacheOnly])

  const nodePairs = useMemo(() => {
    if (!root) return [] as Array<{ h: string; v: number }>
    const acc: Array<{ h: string, v: number }> = []
    const stack: GraphNode[] = [root]
    while (stack.length) {
      const n = stack.pop() as GraphNode
      acc.push({ h: n.personHash, v: Number(n.versionIndex) })
      if (n.children) for (const c of n.children) stack.push(c)
    }
    return acc
  }, [root])

  // Endorsement counts
  useEffect(() => {
    if (strictCacheOnly) return
    if (!loadOptionsSnapshot.includeVersionDetails) return
    if (loading || !contract || !root) return
    let cancelled = false
    ;(async () => {
      const BATCH = getRuntimeFamilyTreeConfig().ENDORSEMENT_STATS_BATCH
      const iface = new ethers.Interface((DeepFamily as any).abi)
      const multicallAddress = (import.meta as any).env.VITE_MULTICALL_ADDRESS
      const useMulticall = !!multicallAddress && provider
      const multicall = useMulticall ? new ethers.Contract(multicallAddress, MULTICALL_ABI, provider) : null

      // Read local cache snapshot to assist with cache hits
      let snapshot: Record<string, NodeData> | null = null
      try {
        const rawSnap = localStorage.getItem(`${storageNS}::nodesData`)
        snapshot = rawSnap ? (JSON.parse(rawSnap) as Record<string, NodeData>) : null
      } catch {}

      // If all nodes already have required fields (endorsementCount and tokenId) in cache, skip network request
      try {
        const allSatisfied = nodePairs.every(p => {
          const id = makeNodeId(p.h, p.v)
          const nd = nodesDataRef.current[id] || (snapshot ? snapshot[id] : undefined)
          return !!nd && nd.endorsementCount !== undefined && nd.tokenId !== undefined
        })
        if (allSatisfied) {
          // Backfill node details missing from memory but present in local snapshot, maintain nodesData as single source of truth
          if (snapshot) {
            setNodesData(prev => {
              let changed = false
              const next = { ...prev }
              for (const p of nodePairs) {
                const id = makeNodeId(p.h, p.v)
                const fromSnap = snapshot![id]
                const cur = next[id]
                const hasRequired = (n?: NodeData) => !!n && n.endorsementCount !== undefined && n.tokenId !== undefined
                if (!hasRequired(cur) && hasRequired(fromSnap)) {
                  next[id] = cur ? { ...cur, ...fromSnap, id: cur.id } : { ...fromSnap }
                  changed = true
                }
              }
              return changed ? next : prev
            })
          }
          return
        }
      } catch {}
      for (let i = 0; i < nodePairs.length && !cancelled; i += BATCH) {
        const slice = nodePairs.slice(i, i + BATCH)
        // Only make requests for nodes missing essential details, while backfilling available data from local snapshot
        const backfills: Record<string, NodeData> = {}
        const targets = slice.filter(p => {
          const id = makeNodeId(p.h, p.v)
          const fromMem = nodesDataRef.current[id]
          const fromSnap = snapshot ? snapshot[id] : undefined
          const hasRequired = (n?: NodeData) => !!n && n.endorsementCount !== undefined && n.tokenId !== undefined
          if (hasRequired(fromMem) || hasRequired(fromSnap)) {
            if (!hasRequired(fromMem) && fromSnap) backfills[id] = fromSnap
            return false
          }
          return true
        })
        if (Object.keys(backfills).length > 0) {
          setNodesData(prev => {
            let changed = false
            const next = { ...prev }
            for (const [id, nd] of Object.entries(backfills)) {
              const cur = next[id]
              const hasRequired = (n?: NodeData) => !!n && n.endorsementCount !== undefined && n.tokenId !== undefined
              if (!hasRequired(cur)) {
                next[id] = cur ? { ...cur, ...nd, id: cur.id } : nd
                changed = true
              }
            }
            return changed ? next : prev
          })
        }
        if (targets.length === 0) continue
        try {
          const calls = targets.map(p => ({ target: contractAddress, callData: iface.encodeFunctionData('getVersionDetails', [p.h, p.v]) }))
          let returned: any[] = []
          if (multicall && useMulticall) {
            try { returned = await multicall.tryAggregate(false, calls) } catch (e) {
              if (!stageLoggedRef.current.has('multicall_tryAggregate_counts')) { stageLoggedRef.current.add('multicall_tryAggregate_counts'); push(e as any, { stage: 'multicall_tryAggregate_counts' }) }
              returned = await Promise.all(calls.map(c => contract.getVersionDetails(...iface.decodeFunctionData('getVersionDetails', c.callData))))
              returned = returned.map(r => [true, iface.encodeFunctionResult('getVersionDetails', r)])
            }
          } else {
            returned = await Promise.all(calls.map(c => contract.getVersionDetails(...iface.decodeFunctionData('getVersionDetails', c.callData))))
            returned = returned.map(r => [true, iface.encodeFunctionResult('getVersionDetails', r)])
          }
          const pendingNFTs: Array<{ id: string; tokenId: string }> = []
          returned.forEach((entry: any, idx: number) => {
            if (cancelled) return
            const original = targets[idx]
            try {
              const success = Array.isArray(entry) ? entry[0] : entry.success
              const returnData = Array.isArray(entry) ? entry[1] : entry.returnData
              if (success && returnData && returnData !== '0x') {
                const decoded: any = iface.decodeFunctionResult('getVersionDetails', returnData)
                // decoded: [PersonVersion version, uint256 endorsementCount, uint256 tokenId]
                const versionStruct: any = decoded?.[0]
                const endorsementCount = Number(decoded?.[1] ?? 0)
                const tokenIdVal = decoded?.[2]
                const tokenId = tokenIdVal !== undefined && tokenIdVal !== null ? tokenIdVal.toString() : '0'
                const id = makeNodeId(original.h, original.v)
                setNodesData(prev => {
                  if (!prev[id]) return prev
                  const vs = versionStruct || {}
                  const fatherHash = vs.fatherHash || vs[1]
                  const motherHash = vs.motherHash || vs[2]
                  const fatherVersionIndex = vs.fatherVersionIndex !== undefined ? Number(vs.fatherVersionIndex) : (vs[4] !== undefined ? Number(vs[4]) : undefined)
                  const motherVersionIndex = vs.motherVersionIndex !== undefined ? Number(vs.motherVersionIndex) : (vs[5] !== undefined ? Number(vs[5]) : undefined)
                  const addedBy = vs.addedBy || vs[6]
                  const timestampRaw = vs.timestamp !== undefined ? vs.timestamp : vs[7]
                  const timestamp = timestampRaw !== undefined && timestampRaw !== null ? Number(timestampRaw) : undefined
                  const tag = vs.tag || vs[8] || prev[id].tag
                  const metadataCID = vs.metadataCID || vs[9]
                  return {
                    ...prev,
                    [id]: {
                      ...prev[id],
                      endorsementCount,
                      tokenId,
                      fatherHash,
                      motherHash,
                      fatherVersionIndex,
                      motherVersionIndex,
                      addedBy,
                      timestamp,
                      tag,
                      metadataCID
                    }
                  }
                })
                if (tokenId !== '0') pendingNFTs.push({ id, tokenId })
              }
            } catch (e) { if (!stageLoggedRef.current.has('decode_counts')) { stageLoggedRef.current.add('decode_counts'); push(e as any, { stage: 'decode_counts' }) } }
          })
          for (const item of pendingNFTs) {
            if (cancelled) break
            const current = nodesDataRef.current[item.id]
            if (!current || current.fullName !== undefined) continue
            try {
              const nftRet = await contract.getNFTDetails(item.tokenId)
              // nftRet: [personHash, versionIndex, version(PersonVersion), coreInfo, endorsementCount, nftTokenURI]
              const versionStruct2: any = nftRet[2]
              const coreInfo: any = nftRet[3]
              const endorsementCountBN2: any = nftRet[4]
              const nftTokenURI: any = nftRet[5]
              const vs2 = versionStruct2 || {}
              const fatherHash = vs2.fatherHash || vs2[1]
              const motherHash = vs2.motherHash || vs2[2]
              const fatherVersionIndex = vs2.fatherVersionIndex !== undefined ? Number(vs2.fatherVersionIndex) : (vs2[4] !== undefined ? Number(vs2[4]) : undefined)
              const motherVersionIndex = vs2.motherVersionIndex !== undefined ? Number(vs2.motherVersionIndex) : (vs2[5] !== undefined ? Number(vs2[5]) : undefined)
              const addedBy = vs2.addedBy || vs2[6]
              const timestampRaw = vs2.timestamp !== undefined ? vs2.timestamp : vs2[7]
              const timestamp = timestampRaw !== undefined && timestampRaw !== null ? Number(timestampRaw) : undefined
              const tag = vs2.tag || vs2[8]
              const metadataCID = vs2.metadataCID || vs2[9]
              const fullName = coreInfo?.supplementInfo?.fullName
              const gender = coreInfo?.basicInfo?.gender !== undefined ? Number(coreInfo.basicInfo.gender) : undefined
              const birthYear = coreInfo?.basicInfo?.birthYear !== undefined ? Number(coreInfo.basicInfo.birthYear) : undefined
              const birthMonth = coreInfo?.basicInfo?.birthMonth !== undefined ? Number(coreInfo.basicInfo.birthMonth) : undefined
              const birthDay = coreInfo?.basicInfo?.birthDay !== undefined ? Number(coreInfo.basicInfo.birthDay) : undefined
              const birthPlace = coreInfo?.supplementInfo?.birthPlace
              const isBirthBC = coreInfo?.basicInfo?.isBirthBC !== undefined ? Boolean(coreInfo.basicInfo.isBirthBC) : undefined
              const deathYear = coreInfo?.supplementInfo?.deathYear !== undefined ? Number(coreInfo.supplementInfo.deathYear) : undefined
              const deathMonth = coreInfo?.supplementInfo?.deathMonth !== undefined ? Number(coreInfo.supplementInfo.deathMonth) : undefined
              const deathDay = coreInfo?.supplementInfo?.deathDay !== undefined ? Number(coreInfo.supplementInfo.deathDay) : undefined
              const deathPlace = coreInfo?.supplementInfo?.deathPlace
              const isDeathBC = coreInfo?.supplementInfo?.isDeathBC !== undefined ? Boolean(coreInfo.supplementInfo.isDeathBC) : undefined
              const story = coreInfo?.supplementInfo?.story
              const endorsementCount2 = endorsementCountBN2 !== undefined && endorsementCountBN2 !== null ? Number(endorsementCountBN2) : undefined
              
              // Get story metadata
              let storyMetadata = undefined
              try {
                const metadata = await contract.getStoryMetadata(item.tokenId)
                storyMetadata = {
                  totalChunks: Number(metadata.totalChunks),
                  totalLength: Number(metadata.totalLength),
                  isSealed: Boolean(metadata.isSealed),
                  lastUpdateTime: Number(metadata.lastUpdateTime),
                  fullStoryHash: metadata.fullStoryHash
                }
              } catch (e) {
                // If fetch fails, set default values
                storyMetadata = {
                  totalChunks: 0,
                  totalLength: 0,
                  isSealed: false,
                  lastUpdateTime: 0,
                  fullStoryHash: ''
                }
              }
              
              setNodesData(prev => {
                const cur = prev[item.id]
                if (!cur || cur.fullName !== undefined) return prev
                return {
                  ...prev,
                  [item.id]: {
                    ...cur,
                    fatherHash: fatherHash ?? cur.fatherHash,
                    motherHash: motherHash ?? cur.motherHash,
                    fatherVersionIndex: fatherVersionIndex ?? cur.fatherVersionIndex,
                    motherVersionIndex: motherVersionIndex ?? cur.motherVersionIndex,
                    addedBy: addedBy ?? cur.addedBy,
                    timestamp: timestamp ?? cur.timestamp,
                    tag: (tag || cur.tag),
                    metadataCID: metadataCID ?? cur.metadataCID,
                    endorsementCount: endorsementCount2 ?? cur.endorsementCount,
                    tokenId: item.tokenId,
                    fullName,
                    gender,
                    birthYear,
                    birthMonth,
                    birthDay,
                    birthPlace,
                    isBirthBC,
                    deathYear,
                    deathMonth,
                    deathDay,
                    deathPlace,
                    isDeathBC,
                    story,
                    nftTokenURI,
                    storyMetadata
                  }
                }
              })
            } catch (e) {
              if (!stageLoggedRef.current.has('nft_details_batch')) { stageLoggedRef.current.add('nft_details_batch'); push(e as any, { stage: 'nft_details_batch' }) }
            }
          }
        } catch (e) { if (!stageLoggedRef.current.has('counts_batch')) { stageLoggedRef.current.add('counts_batch'); push(e as any, { stage: 'counts_batch' }) } }
      }
    })()
    return () => { cancelled = true }
  }, [loadOptionsSnapshot.includeVersionDetails, loading, contract, root, nodePairs, contractAddress, provider, push, strictCacheOnly])

  // Fetch minimal NodeData by tokenId for cold-start deep links (moved above getStoryData to avoid TS hoisting issue)
  const getNodeByTokenId = useCallback(async (tokenId: string): Promise<NodeData | null> => {
    // 1) Prefer in-memory nodesData snapshot
    for (const nd of Object.values(nodesDataRef.current)) {
      if (nd.tokenId && String(nd.tokenId) === String(tokenId)) return nd
    }

    // 2) Try localStorage persisted nodesData (cold start hydration race)
    try {
      const raw = localStorage.getItem(`${storageNS}::nodesData`)
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, NodeData>
        for (const [id, nd] of Object.entries(obj)) {
          if (nd.tokenId && String(nd.tokenId) === String(tokenId)) {
            // Backfill into state for future hits
            setNodesData(prev => prev[id] ? prev : ({ ...prev, [id]: nd }))
            return nd
          }
        }
      }
    } catch {}

    if (!contract) return null
    if (strictCacheOnly) return null
    try {
      const nftRet = await contract.getNFTDetails(tokenId)
      const personHash: string = nftRet[0]
      const versionIndex: number = Number(nftRet[1])
      const versionStruct: any = nftRet[2]
      const coreInfo: any = nftRet[3]
      const endorsementCountBN: any = nftRet[4]
      const nftTokenURI: any = nftRet[5]

      const vs = versionStruct || {}
      const fatherHash = vs.fatherHash || vs[1]
      const motherHash = vs.motherHash || vs[2]
      const fatherVersionIndex = vs.fatherVersionIndex !== undefined ? Number(vs.fatherVersionIndex) : (vs[4] !== undefined ? Number(vs[4]) : undefined)
      const motherVersionIndex = vs.motherVersionIndex !== undefined ? Number(vs.motherVersionIndex) : (vs[5] !== undefined ? Number(vs[5]) : undefined)
      const addedBy = vs.addedBy || vs[6]
      const timestampRaw = vs.timestamp !== undefined ? vs.timestamp : vs[7]
      const timestamp = timestampRaw !== undefined && timestampRaw !== null ? Number(timestampRaw) : undefined
      const tag = vs.tag || vs[8]
      const metadataCID = vs.metadataCID || vs[9]

      const fullName = coreInfo?.supplementInfo?.fullName
      const gender = coreInfo?.basicInfo?.gender !== undefined ? Number(coreInfo.basicInfo.gender) : undefined
      const birthYear = coreInfo?.basicInfo?.birthYear !== undefined ? Number(coreInfo.basicInfo.birthYear) : undefined
      const birthMonth = coreInfo?.basicInfo?.birthMonth !== undefined ? Number(coreInfo.basicInfo.birthMonth) : undefined
      const birthDay = coreInfo?.basicInfo?.birthDay !== undefined ? Number(coreInfo.basicInfo.birthDay) : undefined
      const birthPlace = coreInfo?.supplementInfo?.birthPlace
      const isBirthBC = coreInfo?.basicInfo?.isBirthBC !== undefined ? Boolean(coreInfo.basicInfo.isBirthBC) : undefined
      const deathYear = coreInfo?.supplementInfo?.deathYear !== undefined ? Number(coreInfo.supplementInfo.deathYear) : undefined
      const deathMonth = coreInfo?.supplementInfo?.deathMonth !== undefined ? Number(coreInfo.supplementInfo.deathMonth) : undefined
      const deathDay = coreInfo?.supplementInfo?.deathDay !== undefined ? Number(coreInfo.supplementInfo.deathDay) : undefined
      const deathPlace = coreInfo?.supplementInfo?.deathPlace
      const isDeathBC = coreInfo?.supplementInfo?.isDeathBC !== undefined ? Boolean(coreInfo.supplementInfo.isDeathBC) : undefined
      const story = coreInfo?.supplementInfo?.story
      const endorsementCount = endorsementCountBN !== undefined && endorsementCountBN !== null ? Number(endorsementCountBN) : undefined

      const id = makeNodeId(personHash, versionIndex)
      const node: NodeData = {
        personHash,
        versionIndex,
        id,
        tokenId: String(tokenId),
        fatherHash,
        motherHash,
        fatherVersionIndex,
        motherVersionIndex,
        addedBy,
        timestamp,
        tag,
        metadataCID,
        owner: undefined,
        fullName,
        gender,
        birthYear,
        birthMonth,
        birthDay,
        birthPlace,
        isBirthBC,
        deathYear,
        deathMonth,
        deathDay,
        deathPlace,
        isDeathBC,
        story,
        endorsementCount,
        nftTokenURI,
      }

      setNodesData(prev => ({ ...prev, [id]: { ...(prev[id] || node), ...node } }))
      return node
    } catch (e) {
      return null
    }
  }, [contract, strictCacheOnly])

  // Function to get story data (cache solely via NodesData)
  const getStoryData = useCallback(async (tokenId: string) => {
    // Prefer unified dataset (nodesData) if available and fresh
    const findNodeIdByToken = (): string | undefined => {
      for (const [id, nd] of Object.entries(nodesDataRef.current)) {
        if (nd.tokenId && String(nd.tokenId) === String(tokenId)) return id
      }
      return undefined
    }
    let nodeId = findNodeIdByToken()
    let ndFromLookup: NodeData | undefined
    if (!nodeId) {
      try { const nd = await getNodeByTokenId(tokenId); if (nd) { nodeId = nd.id; ndFromLookup = nd } } catch {}
    }
    if (nodeId) {
      const nd = ndFromLookup || nodesDataRef.current[nodeId]
      if (nd?.storyMetadata && Array.isArray(nd?.storyChunks)) {
        const sorted = [...nd.storyChunks].sort((a,b)=>a.chunkIndex-b.chunkIndex)
        const fullStory = sorted.map(c => c.content).join('')
        const encoder = new TextEncoder()
        const computedLength = sorted.reduce((acc, c) => acc + encoder.encode(c.content).length, 0)
        const missing: number[] = []
        if (nd.storyMetadata?.totalChunks) {
          for (let i = 0; i < nd.storyMetadata.totalChunks; i++) {
            if (!sorted.find(c => c.chunkIndex === i)) missing.push(i)
          }
        }
        let hashMatch: boolean | null = null
        let computedHash: string | undefined
        if (missing.length === 0 && nd.storyMetadata?.totalChunks! > 0 && nd.storyMetadata?.fullStoryHash && nd.storyMetadata.fullStoryHash !== ethers.ZeroHash) {
          try {
            const concatenated = '0x' + sorted.map(c => c.chunkHash.replace(/^0x/, '')).join('')
            computedHash = ethers.keccak256(concatenated)
            hashMatch = computedHash === nd.storyMetadata.fullStoryHash
          } catch {}
        }
        return {
          chunks: sorted,
          fullStory,
          integrity: { missing, lengthMatch: nd.storyMetadata ? (computedLength === nd.storyMetadata.totalLength) : true, hashMatch, computedLength, computedHash },
          metadata: nd.storyMetadata,
          loading: false,
          fetchedAt: Number(nd?.storyFetchedAt || 0)
        }
      }
    }
    // legacy in-memory cache removed; rely solely on NodesData

    if (!provider || !contractAddress) {
      if (strictCacheOnly) return null
      throw new Error('Provider or contract address not available')
    }

    try {
      if (strictCacheOnly) {
        // Strict cache: if memory/local cache misses above, return null directly without triggering network
        return null
      }
      const metadata = await contract!.getStoryMetadata(tokenId)
      const storyMetadata = {
        totalChunks: Number(metadata.totalChunks),
        totalLength: Number(metadata.totalLength),
        isSealed: Boolean(metadata.isSealed),
        lastUpdateTime: Number(metadata.lastUpdateTime),
        fullStoryHash: metadata.fullStoryHash
      }

      const chunks: any[] = []
      if (storyMetadata.totalChunks > 0) {
        for (let i = 0; i < storyMetadata.totalChunks; i++) {
          try {
            const chunk = await contract!.getStoryChunk(tokenId, i)
            chunks.push({
              chunkIndex: Number(chunk.chunkIndex),
              chunkHash: chunk.chunkHash,
              content: chunk.content,
              timestamp: Number(chunk.timestamp),
              lastEditor: chunk.lastEditor
            })
          } catch (e) {
            console.warn(`Missing chunk ${i} for token ${tokenId}`)
          }
        }
      }

      // Compute story integrity
      const sorted = [...chunks].sort((a,b)=>a.chunkIndex-b.chunkIndex)
      const missing: number[] = []
      
      if (storyMetadata?.totalChunks) {
        for (let i = 0; i < storyMetadata.totalChunks; i++) {
          if (!sorted.find(c => c.chunkIndex === i)) missing.push(i)
        }
      }
      
      const fullStory = sorted.map(c => c.content).join('')
      const encoder = new TextEncoder()
      const computedLength = sorted.reduce((acc, c) => acc + encoder.encode(c.content).length, 0)
      const lengthMatch = storyMetadata?.totalLength ? computedLength === storyMetadata.totalLength : true
      
      let hashMatch: boolean | null = null
      let computedHash: string | undefined
      
      if (missing.length === 0 && storyMetadata?.totalChunks > 0 && storyMetadata?.fullStoryHash && storyMetadata.fullStoryHash !== ethers.ZeroHash) {
        try {
          const concatenated = '0x' + sorted.map(c => c.chunkHash.replace(/^0x/, '')).join('')
          computedHash = ethers.keccak256(concatenated)
          hashMatch = computedHash === storyMetadata.fullStoryHash
        } catch {
          // ignore
        }
      }

      const storyData = {
        chunks: chunks.sort((a, b) => a.chunkIndex - b.chunkIndex),
        fullStory,
        integrity: {
          missing,
          lengthMatch,
          hashMatch,
          computedLength,
          computedHash
        },
        metadata: storyMetadata,
        loading: false,
        fetchedAt: Date.now()
      }

      // Backfill unified dataset
      const ensureId = nodeId || findNodeIdByToken()
      if (ensureId) {
        setNodesData(prev => {
          const cur = prev[ensureId!]
          if (!cur) return prev
          return {
            ...prev,
            [ensureId!]: {
              ...cur,
              storyMetadata,
              storyChunks: storyData.chunks,
              storyFetchedAt: Date.now(),
              
            }
          }
        })
      }
      return storyData
    } catch (error: any) {
      console.error('Failed to fetch story chunks:', error)
      throw error
    }
  }, [provider, contractAddress, contract, getNodeByTokenId, strictCacheOnly])

  // Removed helper fetchAndStoreStory; unified via getStoryData and NodesData

  // Clear nodesData + story + owner caches for current namespace
  const clearAllCaches = useCallback(() => {
    setNodesData({})
    setRoot(null)
    try {
      localStorage.removeItem(`${storageNS}::nodesData`)
      localStorage.removeItem(vizRootKey)
    } catch {}
  }, [])

  // Function to preload story data in background
  const preloadStoryData = useCallback((tokenId: string) => {
    getStoryData(tokenId).catch(() => { /* silent */ })
  }, [getStoryData])


  // Derive progress from cached/memory root for fast-path refreshes (no streaming)
  useEffect(() => {
    if (!root) return
    if (loading) return
    setProgress(prev => {
      if (prev && prev.created > 0 && prev.depth > 0) return prev
      // compute node count and max depth from current root
      let count = 0
      let maxDepth = 0
      const stack: Array<{ node: GraphNode; depth: number }> = [{ node: root, depth: 1 }]
      while (stack.length) {
        const { node, depth } = stack.pop() as { node: GraphNode; depth: number }
        count++
        if (depth > maxDepth) maxDepth = depth
        if (node.children && node.children.length) {
          for (const c of node.children) stack.push({ node: c, depth: depth + 1 })
        }
      }
      return { created: count, visited: count, depth: maxDepth }
    })
  }, [refreshTick, root, loading])


  // Cached ownerOf lookup
  const getOwnerOf = useCallback(async (tokenId: string): Promise<string | null> => {
    if (!contract) return null
    // Prefer nodesData snapshot first
    for (const nd of Object.values(nodesDataRef.current)) {
      if (nd.tokenId && String(nd.tokenId) === String(tokenId) && nd.owner) {
        return nd.owner
      }
    }
    // Try localStorage snapshot (before touching network)
    try {
      const raw = localStorage.getItem(`${storageNS}::nodesData`)
      if (raw) {
        const obj = JSON.parse(raw) as Record<string, NodeData>
        for (const [id, nd] of Object.entries(obj)) {
          if (nd.tokenId && String(nd.tokenId) === String(tokenId) && nd.owner) {
            // Backfill owner into state
            setNodesData(prev => {
              const cur = prev[id]
              if (!cur) return { ...prev, [id]: nd }
              if (cur.owner === nd.owner) return prev
              return { ...prev, [id]: { ...cur, owner: nd.owner } }
            })
            return nd.owner
          }
        }
      }
    } catch {}
    if (strictCacheOnly) return null
    try {
      const owner = await contract.ownerOf(tokenId)
      setNodesData(prev => {
        let foundId: string | undefined
        for (const [id, nd] of Object.entries(prev)) {
          if (nd.tokenId && String(nd.tokenId) === String(tokenId)) { foundId = id; break }
        }
        if (!foundId) return prev
        const cur = prev[foundId]
        if (cur.owner === owner) return prev
        return { ...prev, [foundId]: { ...cur, owner } }
      })
      return owner
    } catch { return null }
  }, [contract, strictCacheOnly])

  const value: TreeDataValue = {
    root,
    loading,
    progress,
    contractMessage,
    refresh,
    errors,
    includeVersionDetails,
    nodesData,
    setNodesData,
    getStoryData,
    clearAllCaches,
    preloadStoryData,
    getNodeByTokenId,
    getOwnerOf
  }

  return <TreeDataContext.Provider value={value}>{children}</TreeDataContext.Provider>
}

export function useTreeData() {
  const ctx = useContext(TreeDataContext)
  if (!ctx) throw new Error('useTreeData must be used within TreeDataProvider')
  return ctx
}
