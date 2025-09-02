import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import type { GraphNode } from '../types/graph'
import { makeNodeId, nodeLabel } from '../types/graph'
import { useNodeDetail } from '../context/NodeDetailContext'
import useZoom from '../hooks/useZoom'
import useMiniMap from '../hooks/useMiniMap'
import { ZoomControls, MiniMap } from './ZoomControls'
import { useNodeData } from '../hooks/useNodeData'

export interface FlexibleDAGViewHandle { centerOnNode: (id: string) => void }

function FlexibleDAGViewInner({
  root,
  nodeWidth = 120,
  nodeHeight = 44,
}: {
  root: GraphNode
  nodeWidth?: number
  nodeHeight?: number
}, ref: React.Ref<FlexibleDAGViewHandle>) {
  const { openNode, selected: ctxSelected } = useNodeDetail()
  const ctxSelectedId = ctxSelected ? makeNodeId(ctxSelected.personHash, ctxSelected.versionIndex) : null
  const { svgRef, innerRef, transform, zoomIn, zoomOut, setZoom, kToNorm, normToK, centerOn } = useZoom()

  type FlattenNode = { id: string; label: string; hash: string; versionIndex: number; tag?: string; depth: number }
  type Edge = { from: string; to: string }
  function flatten(root: GraphNode) {
    const nodes: FlattenNode[] = []
    const edges: Edge[] = []
    function rec(n: GraphNode, depth: number, parentId?: string) {
      const id = makeNodeId(n.personHash, n.versionIndex)
      nodes.push({ id, label: nodeLabel(n), hash: n.personHash, versionIndex: n.versionIndex, tag: n.tag, depth })
      if (parentId) edges.push({ from: parentId, to: id })
      for (const c of n.children || []) rec(c, depth + 1, id)
    }
    rec(root, 0)
    return { nodes, edges }
  }

  const { nodes, edges, positions, width, height } = useMemo(() => {
    const { nodes, edges } = flatten(root)
    const levels: Map<number, FlattenNode[]> = new Map()
    let maxDepth = 0
    nodes.forEach(n => { const arr = levels.get(n.depth) || []; arr.push(n); levels.set(n.depth, arr); if (n.depth > maxDepth) maxDepth = n.depth })
    const margin = { left: 24, top: 24, right: 24, bottom: 24 }
    const gapX = nodeWidth + 96
    const gapY = nodeHeight + 20
    const width = margin.left + margin.right + (maxDepth + 1) * gapX
    const maxPerLevel = Math.max(...Array.from(levels.values()).map(a => a.length)) || 1
    const height = margin.top + margin.bottom + maxPerLevel * gapY
    const positions: Record<string, { x: number; y: number }> = {}
    Array.from(levels.entries()).forEach(([depth, arr]) => {
      arr.forEach((n, idx) => { const x = margin.left + depth * gapX; const y = margin.top + idx * gapY; positions[n.id] = { x, y } })
    })
    return { nodes, edges, positions, width, height }
  }, [root, nodeWidth, nodeHeight])

  const textRefs = useRef<Record<string, SVGTextElement | null>>({})
  const [measuredWidths, setMeasuredWidths] = useState<Record<string, number>>({})
  useLayoutEffect(() => {
    const next: Record<string, number> = {}
    for (const id of Object.keys(textRefs.current)) {
      const el = textRefs.current[id]
      if (el && typeof el.getComputedTextLength === 'function') next[id] = Math.max(nodeWidth, Math.ceil(el.getComputedTextLength()) + 16)
    }
    if (Object.keys(next).length) setMeasuredWidths(next)
  }, [nodes, nodeWidth])

  const truncateName = useCallback((name: string, width: number) => {
    if (!name) return ''
    const charW = 8
    const maxChars = Math.max(0, Math.floor((width - 16) / charW))
    if (name.length <= maxChars) return name
    if (maxChars <= 1) return '…'
    return name.slice(0, maxChars - 1) + '…'
  }, [])

  const [hover, setHover] = useState<{ id: string; x: number; y: number; hash: string } | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const toContainer = (svgX: number, svgY: number) => ({ left: transform.x + svgX * transform.k, top: transform.y + svgY * transform.k })
  const recomputeHoverPosition = useCallback(() => {
    const anchorId = ctxSelectedId || hover?.id
    if (!anchorId) return
    const p = positions[anchorId]
    if (!p) return
    const w = (measuredWidths[anchorId] || nodeWidth)
    const scr = toContainer(p.x + w / 2, p.y)
    // only update if changed to prevent infinite setState loop
    setHover(prev => {
      if (!prev || prev.id !== anchorId) return prev
      if (prev.x === scr.left && prev.y === scr.top) return prev
      return { ...prev, x: scr.left, y: scr.top }
    })
  }, [ctxSelectedId, hover?.id, positions, measuredWidths, nodeWidth, transform])
  useEffect(() => { recomputeHoverPosition() }, [transform, recomputeHoverPosition])
  useEffect(() => {
    if (ctxSelectedId) {
      const p = positions[ctxSelectedId]; if (p) {
        const w = measuredWidths[ctxSelectedId] || nodeWidth
        const scr = toContainer(p.x + w / 2, p.y)
        setHover(prev => {
          if (prev && prev.id === ctxSelectedId && prev.x === scr.left && prev.y === scr.top) return prev
          return { id: ctxSelectedId, x: scr.left, y: scr.top, hash: ctxSelected?.personHash || '' }
        })
      }
    } else if (!hover) setHover(null)
  }, [ctxSelectedId, positions, measuredWidths, nodeWidth, transform, ctxSelected, hover])

  const miniNodes = useMemo(() => nodes.map(n => ({ id: n.id, x: positions[n.id].x, y: positions[n.id].y, w: measuredWidths[n.id] || nodeWidth, h: nodeHeight })), [nodes, positions, measuredWidths, nodeWidth, nodeHeight])
  const { miniSvgRef, viewportRef, dims } = useMiniMap({}, { nodes: miniNodes, transform, container: containerRef.current, onCenter: (gx, gy) => {
    const box = containerRef.current?.getBoundingClientRect(); if (!box) return
    centerOn(gx, gy, box.width, box.height)
  } })

  useImperativeHandle(ref, () => ({
    centerOnNode: (id: string) => {
      const p = positions[id]
      if (!p) return
      const w = measuredWidths[id] || nodeWidth
      const h = nodeHeight
      const box = containerRef.current?.getBoundingClientRect(); if (!box) return
      centerOn(p.x + w / 2, p.y + h / 2, box.width, box.height)
    }
  }), [positions, measuredWidths, nodeWidth, nodeHeight, centerOn])

  return (
    <div ref={containerRef} className="relative overflow-auto bg-white dark:bg-transparent rounded-md transition-colors" style={{ height: 560 }}>
      <div className="absolute bottom-3 right-3 z-10">
        <MiniMap width={dims.w} height={dims.h} miniSvgRef={miniSvgRef} viewportRef={viewportRef} />
      </div>
      <ZoomControls className="absolute top-4 right-3 z-10" k={transform.k} kToNorm={kToNorm} normToK={normToK} onSetZoom={setZoom} onZoomIn={zoomIn} onZoomOut={zoomOut} />
      <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${Math.max(width, 800)} ${Math.max(height, 560)}`} className="block min-w-full min-h-full select-none">
        <defs>
          <marker id="ftv-arrow" markerWidth="10" markerHeight="10" refX="10" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" className="fill-slate-400 dark:fill-slate-500" />
          </marker>
        </defs>
        <g ref={innerRef as any}>
          {edges.map((e, i) => {
            const s = positions[e.from]
            const t = positions[e.to]
            const x1 = s.x + (measuredWidths[e.from] || nodeWidth)
            const y1 = s.y + nodeHeight / 2
            const x2 = t.x
            const y2 = t.y + nodeHeight / 2
            const mx = (x1 + x2) / 2
            return (
              <path key={i} d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} className="stroke-slate-300 dark:stroke-slate-600" fill="none" markerEnd="url(#ftv-arrow)" />
            )
          })}
          {nodes.map(n => {
            const p = positions[n.id]
            const w = measuredWidths[n.id] || nodeWidth
            const nd = useNodeData(n.id)
            const mintedFlag = !!(nd?.tokenId && nd.tokenId !== '0')
            const nameDisplay = nd?.fullName ? truncateName(nd.fullName, w) : undefined
            const endorse = nd?.endorsementCount
            const hashShort = n.hash.replace(/0x([0-9a-fA-F]{4})[0-9a-fA-F]+/, '0x$1…')
            const isSelected = ctxSelectedId === n.id
            return (
              <g key={n.id}
                 transform={`translate(${p.x}, ${p.y})`}
                 onMouseEnter={() => { if (!ctxSelectedId) setHover({ id: n.id, x: 0, y: 0, hash: n.hash }) }}
                 onMouseLeave={() => { if (!(ctxSelectedId && ctxSelectedId === n.id)) setHover(null) }}
                 onClick={() => openNode({ personHash: n.hash, versionIndex: n.versionIndex})}
                 className="cursor-pointer">
                <title>{n.hash}</title>
                <rect
                  width={w}
                  height={nodeHeight}
                  rx="8"
                  ry="8"
                  className={`${mintedFlag
                    ? 'fill-emerald-100 dark:fill-emerald-900/30 stroke-emerald-300 dark:stroke-emerald-400'
                    : isSelected
                      ? 'fill-amber-100 dark:fill-amber-900/30 stroke-amber-400 dark:stroke-amber-400/70'
                      : 'fill-gray-50 dark:fill-transparent stroke-green-600 dark:stroke-green-500'} shadow-sm transition-colors`}
                  strokeWidth={mintedFlag || isSelected ? 2 : 1}
                />
                {mintedFlag ? (
                  <circle cx={w - 6} cy={6} r={3} className="fill-emerald-500 stroke-white dark:stroke-gray-900" strokeWidth={1} />
                ) : null}
                <text ref={el => { textRefs.current[n.id] = el }} className="font-mono">
                  <tspan x={8} y={16} className={`text-[16px] ${mintedFlag ? 'fill-emerald-700 dark:fill-emerald-300' : 'fill-gray-900 dark:fill-gray-100'}`}>{hashShort}</tspan>
                  <tspan x={w - 8} y={16} textAnchor="end" className={`text-[16px] ${mintedFlag ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-slate-700 dark:fill-slate-300'}`}>v{n.versionIndex}</tspan>
                </text>
                <text className="font-mono">
                  {nameDisplay && (
                    <tspan x={8} y={nodeHeight - 6} className={`text-[16px] ${mintedFlag ? 'fill-emerald-700 dark:fill-emerald-300' : 'fill-slate-800 dark:fill-slate-200'}`}>{nameDisplay}</tspan>
                  )}
                  <tspan x={w - 8} y={nodeHeight - 6} textAnchor="end" className={`text-[16px] ${mintedFlag ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-slate-700 dark:fill-slate-300'}`}>{endorse !== undefined ? endorse : ''}</tspan>
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

const FlexibleDAGView = forwardRef(FlexibleDAGViewInner)
export default FlexibleDAGView


