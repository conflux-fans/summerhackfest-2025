// Minimal React tree rendering demo for DeepFamily (migrated)
import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import HashBadge from './HashBadge'
import { shortHash } from '../types/graph'
import { ethers } from 'ethers'
import { useNavigate } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'
import { makeNodeId, type GraphNode, isMinted } from '../types/graph'
import { FixedSizeList as VirtualList, ListChildComponentProps } from 'react-window'
import { getRuntimeFamilyTreeConfig } from '../config/familyTreeConfig'
import { useNodeDetail } from '../context/NodeDetailContext'
import { useTreeData } from '../context/TreeDataContext'
import { LAYOUT, useFamilyTreeHeight } from '../constants/layout'

const Node: React.FC<{ node: GraphNode; depth?: number; isLast?: boolean }> = React.memo(function Node({ node, depth = 0, isLast = true }) {
  const indentPx = depth * 16
  const branch = depth === 0 ? "" : (isLast ? "└─ " : "├─ ")
  const [open, setOpen] = useState(true)
  const hasChildren = !!(node.children && node.children.length > 0)
  const navigate = useNavigate()
  const cfg = useConfig()
  const goDetail = useCallback(() => { cfg.update({ rootHash: node.personHash, rootVersionIndex: node.versionIndex }); navigate(`/familyTree?root=${node.personHash}&v=${node.versionIndex}`) }, [cfg, navigate, node.personHash, node.versionIndex])
  const toggle = useCallback(() => setOpen(o => !o), [])
  return (
    <li>
      <div className="flex items-center gap-2 group" style={{ marginLeft: indentPx, whiteSpace: 'pre' }}>
        <span className="text-gray-400 select-none">{branch}</span>
        <button onClick={toggle} className="w-5 h-5 grid place-items-center rounded hover:bg-gray-100 text-gray-500" aria-label={hasChildren ? (open ? 'collapse' : 'expand') : 'leaf'}>
          {hasChildren ? (open ? '▾' : '▸') : '·'}
        </button>
        <HashBadge hash={node.personHash} onNavigate={goDetail} />
        <span className="text-sm text-gray-500 font-medium">v{node.versionIndex}</span>
        {node.tag ? <span className="text-xs text-blue-600">({node.tag})</span> : null}
      </div>
      {open && hasChildren && (
        <ul className="list-none m-0 p-0">
          {node.children!.map((child, i) => (
            <Node key={`${child.personHash}-${child.versionIndex}-${i}`} node={child} depth={depth + 1} isLast={i === node.children!.length - 1} />
          ))}
        </ul>
      )}
    </li>
  )
}, (prev, next) => (
  prev.node.personHash === next.node.personHash &&
  prev.node.versionIndex === next.node.versionIndex &&
  prev.node.tag === next.node.tag &&
  (prev.node.children?.length || 0) === (next.node.children?.length || 0) &&
  prev.depth === next.depth &&
  prev.isLast === next.isLast
))

/**
 * Depth-first fetch Merkle / Family subtree.
 * Optimization features:
 * - AbortSignal
 * - Version info + child node paging cache (avoid duplicate RPC)
 * - Concurrency limits / node hard limits
 * - onNode callback (when node is first created)
 */
export type FilterInput = { personHash: string; versionIndex: number; depth: number; tag?: string }
export type FilterDecision = boolean | { include?: boolean; descend?: boolean }
export type FetchSubtreeOptions = {
  maxDepth?: number
  pageSize?: number
  parallel?: number
  signal?: AbortSignal
  hardNodeLimit?: number
  onNode?: (node: GraphNode) => void
  filter?: (info: FilterInput) => FilterDecision
  onProgress?: (stats: { created: number; visited: number; depth: number }) => void
  onStats?: (metrics: WalkerMetrics) => void
  statsIntervalMs?: number
  traversal?: 'dfs' | 'bfs'
  adaptiveConcurrency?: boolean
  minParallel?: number
  maxParallel?: number
}

export interface WalkerMetrics {
  created: number
  visited: number
  depth: number
  versionCacheHits: number
  versionCacheMisses: number
  childrenCacheHits: number
  childrenCacheMisses: number
  avgVersionMs: number
  avgChildrenMs: number
  parallel: number
}

function createTreeLoader(params: { contract: ethers.Contract; pageSize: number; signal?: AbortSignal; onStats?: (m: WalkerMetrics)=>void; metricsRef: React.MutableRefObject<WalkerMetrics>; statsIntervalMs?: number }) {
  const { contract, pageSize, signal, onStats, metricsRef, statsIntervalMs } = params
  const versionCache = new Map<string, { tag?: string }>()
  const childrenCache = new Map<string, { childHashes: string[]; childVersionIndices: (number|bigint)[]; hasMore: boolean; nextOffset: number; pageOffset: number }>()
  const key = (h: string, v: number) => `${h.toLowerCase()}-v-${v}`
  const checkAbort = () => { if (signal?.aborted) throw new DOMException('Aborted', 'AbortError') }
  let lastStatsEmit = 0
  function emit(now: number) {
    if (!onStats) return
    if (!statsIntervalMs || now - lastStatsEmit >= statsIntervalMs) { lastStatsEmit = now; onStats({ ...metricsRef.current }) }
  }

  async function loadVersion(h: string, v: number) {
    checkAbort()
    const k = key(h, v)
    const start = performance.now()
    // tags no longer fetched separately; keep structure for potential future fields
    if (!versionCache.has(k)) { metricsRef.current.versionCacheMisses++; versionCache.set(k, { tag: undefined }) } else { metricsRef.current.versionCacheHits++ }
    emit(start)
    return versionCache.get(k)!
  }

  async function loadChildrenPage(h: string, v: number, offset: number) {
    checkAbort()
    const cacheKey = `${key(h,v)}:o:${offset}`
    const start = performance.now()
    if (childrenCache.has(cacheKey)) { metricsRef.current.childrenCacheHits++; emit(start); return childrenCache.get(cacheKey)! }
    metricsRef.current.childrenCacheMisses++
    try {
      const r = await contract.listChildren(h, v, offset, pageSize)
      const entry = { childHashes: r[0] as string[], childVersionIndices: r[1] as (number|bigint)[], hasMore: Boolean(r[3]), nextOffset: Number(r[4]), pageOffset: offset }
      childrenCache.set(cacheKey, entry)
      return entry
    } catch {
      const entry = { childHashes: [], childVersionIndices: [], hasMore: false, nextOffset: offset, pageOffset: offset }
      childrenCache.set(cacheKey, entry)
      return entry
    } finally {
      const dur = performance.now() - start
      const m = metricsRef.current
      m.avgChildrenMs = m.avgChildrenMs === 0 ? dur : (m.avgChildrenMs * 0.9 + dur * 0.1)
      emit(performance.now())
    }
  }
  return { loadVersion, loadChildrenPage, key, checkAbort }
}

async function* walkSubtree(
  contract: ethers.Contract,
  personHash: string,
  versionIndex: number,
  options?: FetchSubtreeOptions
): AsyncGenerator<GraphNode, GraphNode, void> {
  const runtimeCfg = getRuntimeFamilyTreeConfig()
  const maxDepth = options?.maxDepth ?? runtimeCfg.DEFAULT_MAX_DEPTH
  const pageSize = options?.pageSize ?? 25
  let parallel = Math.max(1, options?.parallel ?? 6)
  const signal = options?.signal
  const hardNodeLimit = options?.hardNodeLimit ?? 2500
  const filter = options?.filter
  const onNode = options?.onNode
  const onProgress = options?.onProgress
  const onStats = options?.onStats
  const traversal = options?.traversal || 'dfs'
  const adaptive = options?.adaptiveConcurrency !== false
  const minParallel = Math.max(1, options?.minParallel ?? 1)
  const maxParallel = Math.max(minParallel, options?.maxParallel ?? parallel * 2)
  const metricsRef = { current: { created:0, visited:0, depth:0, versionCacheHits:0, versionCacheMisses:0, childrenCacheHits:0, childrenCacheMisses:0, avgVersionMs:0, avgChildrenMs:0, parallel } as WalkerMetrics }
  const { loadVersion, loadChildrenPage, key, checkAbort } = createTreeLoader({ contract, pageSize, signal, onStats, metricsRef, statsIntervalMs: options?.statsIntervalMs })
  if (signal?.aborted) throw new DOMException('Aborted','AbortError')
  const visited = new Set<string>()
  const root: GraphNode = { personHash, versionIndex, children: [] }

  function decide(fi: FilterInput): { include: boolean; descend: boolean } {
    const r = filter ? filter(fi) : true
    if (typeof r === 'boolean') return { include: r, descend: r }
    return { include: r.include !== false, descend: r.descend !== false }
  }

  async function* dfs(h: string, v: number, depth: number, parent?: GraphNode): AsyncGenerator<GraphNode, void, void> {
    checkAbort()
    const k = key(h, v)
    if (visited.has(k) || depth > maxDepth || metricsRef.current.created >= hardNodeLimit) return
    visited.add(k)
    metricsRef.current.visited = visited.size
    const { tag } = await loadVersion(h, v)
    const { include, descend } = decide({ personHash: h, versionIndex: v, depth, tag })
    let node: GraphNode | undefined
    if (include) {
      metricsRef.current.created++
      metricsRef.current.depth = depth
      if (parent) {
        node = { personHash: h, versionIndex: v, tag, children: [] }
        parent.children = parent.children ? [...parent.children, node] : [node]
      } else { node = root; node.tag = tag }
      onNode?.(node)
      onProgress?.({ created: metricsRef.current.created, visited: visited.size, depth })
      yield node
    }
    if (!descend || depth >= maxDepth || metricsRef.current.created >= hardNodeLimit) return

    let offset = 0
    let prefetch: Promise<any> | null = null
    while (true) {
      checkAbort()
      if (metricsRef.current.created >= hardNodeLimit) break
      const page = prefetch ? await prefetch : await loadChildrenPage(h, v, offset)
      prefetch = null
      const { childHashes, childVersionIndices, hasMore, nextOffset } = page
      if (hasMore) prefetch = loadChildrenPage(h, v, nextOffset)
      if (childHashes.length && node) {
        const tasks = childHashes.map((ch: string, i: number)=>({ ch, cv:Number(childVersionIndices[i]) }))
        if (adaptive) {
          const m = metricsRef.current
            if (m.avgChildrenMs > 900 && parallel > minParallel) parallel = Math.max(minParallel, Math.floor(parallel/2))
            else if (m.avgChildrenMs < 250 && parallel < maxParallel) parallel = Math.min(maxParallel, parallel+1)
            m.parallel = parallel
        }
        for (let i=0; i<tasks.length; i+=parallel) {
          const slice = tasks.slice(i, i+parallel)
          for (const t of slice) { for await (const _ of dfs(t.ch, t.cv, depth+1, node)) { /* streaming forward */ } }
          if (metricsRef.current.created >= hardNodeLimit) break
        }
      }
      if (!hasMore || metricsRef.current.created >= hardNodeLimit) break
      offset = nextOffset
    }
  }

  async function* bfs(): AsyncGenerator<GraphNode, void, void> {
    const queue: Array<{ h:string; v:number; depth:number; parent?: GraphNode }> = [{ h: personHash, v: versionIndex, depth:1 }]
    while (queue.length) {
      checkAbort(); if (metricsRef.current.created >= hardNodeLimit) break
      const { h, v, depth, parent } = queue.shift()!
      const k = key(h,v)
      if (visited.has(k) || depth > maxDepth) continue
      visited.add(k); metricsRef.current.visited = visited.size
      const { tag } = await loadVersion(h,v)
      const { include, descend } = decide({ personHash: h, versionIndex: v, depth, tag })
      let node: GraphNode | undefined
      if (include) {
        metricsRef.current.created++; metricsRef.current.depth=depth
        node = parent ? { personHash:h, versionIndex:v, tag, children:[] } : root
        if (parent) parent.children = parent.children ? [...parent.children, node] : [node]; else root.tag = tag
        onNode?.(node); onProgress?.({ created: metricsRef.current.created, visited: visited.size, depth }); yield node!
      }
      if (!descend || depth >= maxDepth || metricsRef.current.created >= hardNodeLimit) continue
      let offset = 0; let prefetch: Promise<any>|null = null
      while (true) {
        checkAbort(); if (metricsRef.current.created >= hardNodeLimit) break
        const page = prefetch ? await prefetch : await loadChildrenPage(h,v,offset); prefetch=null
        const { childHashes, childVersionIndices, hasMore, nextOffset } = page
        if (hasMore) prefetch = loadChildrenPage(h,v,nextOffset)
        for (let i=0;i<childHashes.length;i++) queue.push({ h: childHashes[i], v:Number(childVersionIndices[i]), depth: depth+1, parent: node })
        if (!hasMore) break; offset = nextOffset
      }
    }
  }

  if (traversal === 'bfs') { for await (const _ of bfs()) {/* streaming bfs */} } else { for await (const _ of dfs(personHash, versionIndex, 1)) {/* streaming dfs */} }
  return root
}

export async function fetchSubtree(contract: ethers.Contract, personHash: string, versionIndex: number, options?: FetchSubtreeOptions) {
  const gen = walkSubtree(contract, personHash, versionIndex, options)
  let root: GraphNode | null = null
  for await (const node of gen) { if (!root) root = node }
  return root!
}

export async function* fetchSubtreeStream(contract: ethers.Contract, personHash: string, versionIndex: number, options?: FetchSubtreeOptions) {
  yield* walkSubtree(contract, personHash, versionIndex, options)
}

interface FlatRow { node: GraphNode; depth: number; isLast: boolean }
function flattenTree(root: GraphNode, expanded: Set<string>): FlatRow[] {
  const rows: FlatRow[] = []
  const stack: Array<{ node: GraphNode; depth: number }> = [{ node: root, depth: 0 }]
  while (stack.length) {
    const { node, depth } = stack.pop()!
    rows.push({ node, depth, isLast: true })
    if (expanded.has(node.personHash + ':' + node.versionIndex) && node.children && node.children.length) {
      for (let i = node.children.length - 1; i >= 0; i--) stack.push({ node: node.children[i], depth: depth + 1 })
    }
  }
  function mark(parent: GraphNode) {
    const key = parent.personHash + ':' + parent.versionIndex
    if (!expanded.has(key) || !parent.children) return
    parent.children.forEach((c,i)=>{
      const idx = rows.findIndex(r => r.node === c)
      if (idx >= 0) rows[idx].isLast = i === parent.children!.length -1
      mark(c)
    })
  }
  mark(root)
  return rows
}

export const VirtualizedContractTree: React.FC<{ root: GraphNode; height?: number; rowHeight?: number }> = ({ root, height, rowHeight = LAYOUT.ROW_HEIGHT }) => {
  const responsiveHeight = useFamilyTreeHeight()
  const familyTreeHeight = height || responsiveHeight
  const { nodesData } = useTreeData() as any
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([root.personHash + ':' + root.versionIndex]))
  const rows = useMemo(() => flattenTree(root, expanded), [root, expanded])
  const toggle = useCallback((node: GraphNode) => {
    setExpanded(prev => { const k = node.personHash + ':' + node.versionIndex; const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })
  }, [])
  const getKey = (n: GraphNode) => n.personHash + ':' + n.versionIndex
  const { openNode, selected } = useNodeDetail()
  const selectedKey = selected ? `${selected.personHash}:${selected.versionIndex}` : null
  const Row = useCallback(({ index, style }: ListChildComponentProps) => {
    const { node, depth, isLast } = rows[index]
    const hasChildren = !!(node.children && node.children.length)
    const k = getKey(node)
    const isOpen = expanded.has(k)
    const cacheKey = makeNodeId(node.personHash, node.versionIndex)
    const name = nodesData?.[cacheKey]?.fullName
    const endorse = nodesData?.[cacheKey]?.endorsementCount
    const mintedFlag = isMinted(nodesData?.[cacheKey])
    const gender = nodesData?.[cacheKey]?.gender as number | undefined
    const isSel = selectedKey === k
    const ancestorGuides: boolean[] = []
    if (depth > 0) {
      let currentDepth = depth - 1
      for (let i = index - 1; i >= 0 && currentDepth >= 0; i--) {
        const r = rows[i]
        if (r.depth === currentDepth) { ancestorGuides[currentDepth] = !r.isLast; currentDepth-- }
      }
    }
    return (
      <div style={{ ...style }} className={`group font-mono text-[12px] flex items-stretch relative ${isSel ? 'bg-amber-100 dark:bg-amber-900/40' : (index % 2 ? 'bg-white dark:bg-gray-800' : 'bg-slate-50 dark:bg-gray-800/60')} hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors`}
           onClick={() => openNode({ personHash: node.personHash, versionIndex: node.versionIndex})}>
        <div className="absolute inset-y-0 left-0 flex pointer-events-none">
          {ancestorGuides.map((show, i) => show ? (
            <div key={i} style={{ width: 16 }} className="flex-shrink-0 relative">
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-600" />
            </div>
          ) : (<div key={i} style={{ width:16 }} />))}
        </div>
        <div style={{ paddingLeft: depth * 16 }} className="flex items-center gap-1 pl-1 pr-2 min-w-[140px] relative w-full" title={node.personHash}>
          <div className="flex items-center">
            {depth>0 && (
              <div className="relative" style={{ width:16, height: rowHeight }}>
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-1/2 bg-slate-300 dark:bg-slate-600" />
                {!isLast && <div className="absolute left-1/2 -translate-x-1/2 top-1/2 bottom-0 w-px bg-slate-300 dark:bg-slate-600" />}
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 h-px w-1/2 bg-slate-300 dark:bg-slate-600" />
              </div>
            )}
            <button onClick={(e)=>{ e.stopPropagation(); hasChildren && toggle(node) }} className={`mr-1 w-5 h-5 grid place-items-center rounded border text-[10px] ${hasChildren ? 'bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border-slate-300 dark:border-gray-600 text-slate-700 dark:text-slate-300' : 'border-transparent text-slate-400 dark:text-slate-500 cursor-default'}`}>{hasChildren ? (isOpen ? '−' : '+') : '·'}</button>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full">
            <span className="text-slate-600 dark:text-slate-300">{shortHash(node.personHash)}</span>
            <span className="text-sky-600 dark:text-sky-400">v{node.versionIndex}</span>
            {endorse !== undefined && (
              <span className="inline-flex items-center gap-1" title="Endorsements">
                <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" className="flex-shrink-0">
                  <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L10 1.5z" className={mintedFlag ? 'fill-emerald-500' : 'fill-slate-500'} />
                </svg>
                <span className={`font-mono text-[12px] ${mintedFlag ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>{endorse}</span>
              </span>
            )}
            {mintedFlag && (
              <>
                <span className="text-[10px] px-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/40">NFT</span>
                {(() => {
                  const genderDotClass = gender === 1
                    ? 'bg-sky-500'
                    : gender === 2
                      ? 'bg-rose-500'
                      : gender === 3
                        ? 'bg-violet-500'
                        : 'bg-slate-400'
                  return <span className={`ml-1 inline-block w-2 h-2 rounded-full ${genderDotClass} ring-1 ring-white dark:ring-slate-900`} />
                })()}
              </>
            )}
            {name && <span className="text-slate-700 dark:text-slate-200 text-[12px] truncate max-w-[180px]" title={name}>{name}</span>}
            {node.tag && <span className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/40 px-1 rounded" title={node.tag}>{node.tag}</span>}
          </div>
        </div>
      </div>
    )
  }, [rows, expanded, rowHeight, toggle, openNode, selectedKey, nodesData])
  return (
    <div className="w-full bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-900/90 dark:via-slate-800/60 dark:to-slate-900/90 rounded-2xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 shadow-xl backdrop-blur-sm overflow-hidden" style={{ height: familyTreeHeight }}>
      <div className="p-4 pt-16 h-full">
        <VirtualList height={familyTreeHeight - 32} itemCount={rows.length} itemSize={rowHeight} width={'100%'}>{Row}</VirtualList>
      </div>
    </div>
  )
}

export function ContractTree({ root }: { root: GraphNode }) {
  return <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}><Node node={root} /></ul>
}
