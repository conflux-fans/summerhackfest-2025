import React, { useLayoutEffect, useMemo, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import type { GraphNode } from '../types/graph'
import { makeNodeId } from '../types/graph'
import { useNodeDetail } from '../context/NodeDetailContext'
import useZoom from '../hooks/useZoom'
import useMiniMap from '../hooks/useMiniMap'
import { ZoomControls, MiniMap } from './ZoomControls'
import NodeCard from './NodeCard'
import { useNodeData } from '../hooks/useNodeData'
import { shortHash } from '../types/graph'
import { isMinted } from '../types/graph'
import { birthDateString } from '../types/graph'
import { useFamilyTreeHeight } from '../constants/layout'

export interface MerkleTreeViewHandle { centerOnNode: (id: string) => void }

const BASE_NODE_WIDTH = 112
const MAX_NODE_WIDTH = 168
const NODE_HEIGHT = 160
const GAP_X = 24
const GAP_Y = 220
const MARGIN_X = 24
const MARGIN_Y = 0
const PADDING_X = 12
const TITLE_START_Y = 26
const TITLE_LINE_H = 18
const DIVIDER_GAP = 10
const BODY_GAP = 12
const BODY_LINE_H = 16
const BODY_LINE_GAP = 4
const FOOTER_BADGE_H = 16
const FOOTER_PADDING = 12
const SMALL_CHAR_W = 7
const COL_GAP = 10
const STAR_OUTER_R = 9
const STAR_INNER_R = 4.5
const TAG_BADGE_H = 16
const TAG_GAP = 8
const GENDER_DOT_R = 4
const GENDER_DOT_GAP = 4

function buildStarPath(cx: number, cy: number, spikes = 5, outerR = STAR_OUTER_R, innerR = STAR_INNER_R): string {
  const step = Math.PI / spikes
  let rot = -Math.PI / 2
  let path = ''
  for (let i = 0; i < spikes * 2; i++) {
    const r = (i % 2 === 0) ? outerR : innerR
    const x = cx + Math.cos(rot) * r
    const y = cy + Math.sin(rot) * r
    path += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
    rot += step
  }
  path += ' Z'
  return path
}

type PositionedNode = { id: string; data: GraphNode; depth: number; x: number; y: number }

function computeLayout(root: GraphNode) {
  const nodes: PositionedNode[] = []
  let nextLeafIndex = 0
  let maxDepth = 0
  const unitWidth = BASE_NODE_WIDTH + GAP_X
  function layout(node: GraphNode, depth: number): { x: number; y: number } {
    maxDepth = Math.max(maxDepth, depth)
    const children = node.children || []
    let x: number
    const y = MARGIN_Y + depth * GAP_Y
    if (children.length === 0) { x = nextLeafIndex * unitWidth; nextLeafIndex += 1 } else {
      const childPositions = children.map(c => layout(c, depth + 1))
      const minX = childPositions[0].x
      const maxX = childPositions[childPositions.length - 1].x
      x = (minX + maxX) / 2
    }
    const id = makeNodeId(node.personHash, node.versionIndex)
    nodes.push({ id, data: node, depth, x, y })
    return { x, y }
  }
  layout(root, 0)
  let minX = Infinity, maxX = -Infinity
  for (const n of nodes) { minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x) }
  const offsetX = MARGIN_X - minX
  for (const n of nodes) n.x += offsetX
  const width = (maxX - minX) + BASE_NODE_WIDTH + MARGIN_X * 2
  const height = MARGIN_Y * 2 + maxDepth * GAP_Y + NODE_HEIGHT
  return { nodes, width, height }
}

function MerkleTreeViewInner({ root }: { root: GraphNode }, ref: React.Ref<MerkleTreeViewHandle>) {
  const { nodes: positioned, width: svgWidth, height: svgHeight } = useMemo(() => computeLayout(root), [root])
  const idToPos = useMemo(() => { const m = new Map<string, PositionedNode>(); for (const pn of positioned) m.set(pn.id, pn); return m }, [positioned])
  const textRefs = useRef<Record<string, SVGTextElement | null>>({})
  const [measuredWidths, setMeasuredWidths] = useState<Record<string, number>>({})
  useLayoutEffect(() => { const next: Record<string, number> = {}; for (const id of Object.keys(textRefs.current)) { const el = textRefs.current[id]; if (el?.getComputedTextLength) { const computed = Math.ceil(el.getComputedTextLength()) + 16; next[id] = Math.max(BASE_NODE_WIDTH, Math.min(MAX_NODE_WIDTH, computed)) } } if (Object.keys(next).length) setMeasuredWidths(next) }, [positioned])
  const wrapNameTwoLines = useCallback((name: string, width: number): string[] => { if (!name) return []; const charW = 8; const pad = 16; const maxPerLine = Math.max(3, Math.floor((width - pad) / charW)); if (name.length <= maxPerLine) return [name]; const first = name.slice(0, maxPerLine); const remain = name.slice(maxPerLine); if (remain.length <= maxPerLine - 1) return [first, remain]; const second = remain.slice(0, Math.max(0, maxPerLine - 1)) + '…'; return [first, second] }, [])
  const truncateByWidth = useCallback((text: string, maxPx: number, charW = SMALL_CHAR_W) => { if (!text) return ''; const maxChars = Math.max(0, Math.floor(maxPx / charW)); if (text.length <= maxChars) return text; if (maxChars <= 1) return '…'; return text.slice(0, maxChars - 1) + '…' }, [])
  const truncateNoEllipsisByWidth = useCallback((text: string, maxPx: number, charW = SMALL_CHAR_W) => { if (!text) return ''; const maxChars = Math.max(0, Math.floor(maxPx / charW)); return text.slice(0, maxChars) }, [])
  const [hoverId, setHoverId] = useState<string | null>(null)
  const { openNode, selected: ctxSelected } = useNodeDetail()
  const selectedId = ctxSelected ? makeNodeId(ctxSelected.personHash, ctxSelected.versionIndex) : null
  const { svgRef, innerRef, transform, zoomIn, zoomOut, setZoom, kToNorm, normToK, centerOn } = useZoom()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const responsiveHeight = useFamilyTreeHeight()

  const miniNodes = useMemo(() => positioned.map(pn => ({ id: pn.id, x: pn.x, y: pn.y, w: measuredWidths[pn.id] || BASE_NODE_WIDTH, h: NODE_HEIGHT })), [positioned, measuredWidths])
  const { miniSvgRef, viewportRef, dims } = useMiniMap({ width: 120, height: 90 }, { nodes: miniNodes, transform, container: containerRef.current, onCenter: (gx, gy) => {
    const box = containerRef.current?.getBoundingClientRect(); if (!box) return
    centerOn(gx, gy, box.width, box.height)
  } })

  useImperativeHandle(ref, () => ({
    centerOnNode: (id: string) => {
      const pn = idToPos.get(id)
      if (!pn) return
      const w = measuredWidths[id] || BASE_NODE_WIDTH
      const box = containerRef.current?.getBoundingClientRect(); if (!box) return
      centerOn(pn.x + w / 2, pn.y + NODE_HEIGHT / 2, box.width, box.height)
    }
  }), [idToPos, measuredWidths, centerOn])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-900/90 dark:via-slate-800/60 dark:to-slate-900/90 rounded-2xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 shadow-xl backdrop-blur-sm pt-16"
      style={{ height: responsiveHeight, overscrollBehavior: 'contain' }}
    >
      <div className="absolute bottom-3 left-3 z-10 scale-75 md:scale-100 origin-bottom-left"><MiniMap width={dims.w} height={dims.h} miniSvgRef={miniSvgRef} viewportRef={viewportRef} /></div>
      <ZoomControls className="absolute top-20 right-3 z-10" k={transform.k} kToNorm={kToNorm} normToK={normToK} onSetZoom={setZoom} onZoomIn={zoomIn} onZoomOut={zoomOut} />
      <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${Math.max(svgWidth, 800)} ${Math.max(svgHeight, responsiveHeight)}`} className="block min-w-full min-h-full select-none" style={{ touchAction: 'none' }}>
        <defs>
          <linearGradient id="cardGlossGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g ref={innerRef as any}>
          <g className="stroke-blue-300/70 dark:stroke-blue-500/60" strokeWidth={2} fill="none">
            {positioned.map(pn => (pn.data.children || []).map(child => {
              const childId = makeNodeId(child.personHash, child.versionIndex)
              const childPos = idToPos.get(childId)
              if (!childPos) return null
              const w1 = measuredWidths[pn.id] || BASE_NODE_WIDTH
              const w2 = measuredWidths[childId] || BASE_NODE_WIDTH
              const x1 = pn.x + w1 / 2
              const y1 = pn.y + NODE_HEIGHT
              const x2 = childPos.x + w2 / 2
              const y2 = childPos.y
              const mx = (x1 + x2) / 2
              const path = `M ${x1} ${y1} C ${mx} ${y1 + 24}, ${mx} ${y2 - 24}, ${x2} ${y2}`
              return <path key={`${pn.id}->${childId}`} d={path} />
            }))}
          </g>
          <g>
            {positioned.map(pn => {
              const w = measuredWidths[pn.id] || BASE_NODE_WIDTH
              const nd = useNodeData(pn.id)
              const mintedFlag = isMinted(nd)
              const shortHashText = shortHash(pn.data.personHash)
              const nameTextRaw = (mintedFlag && nd?.fullName) ? nd.fullName : shortHashText
              const nameDisplaySingle = truncateNoEllipsisByWidth(nameTextRaw || '', Math.max(0, w - PADDING_X * 2), 8)
              const nameLines = nameDisplaySingle ? [nameDisplaySingle] : []
              const endorse = nd?.endorsementCount
              const isSel = pn.id === selectedId
              const isHover = hoverId === pn.id
              const versionText = `v${pn.data.versionIndex}`
              const tagTextRaw = nd?.tag || ''
              const tagText = truncateNoEllipsisByWidth(tagTextRaw, Math.max(0, w - PADDING_X * 2))
              return (
                <g key={pn.id}
                   transform={`translate(${pn.x}, ${pn.y})`}
                   onMouseEnter={() => setHoverId(pn.id)}
                   onMouseLeave={() => setHoverId(h => (h === pn.id ? null : h))}
                   onClick={() => openNode({ personHash: pn.data.personHash, versionIndex: pn.data.versionIndex})}
                   onDoubleClick={() => navigator.clipboard?.writeText(pn.data.personHash).catch(() => {})}
                >
                  <title>{pn.data.personHash}</title>
                  {/* Hidden text for width measurement with maximum width constraint */}
                  <text ref={el => { textRefs.current[pn.id] = el }} opacity={0} className="font-mono pointer-events-none select-none">
                    <tspan x={8} y={14}>{(mintedFlag && nd?.fullName) ? nd.fullName : shortHashText}</tspan>
                  </text>

                  <NodeCard w={w} h={NODE_HEIGHT} minted={mintedFlag} selected={isSel} hover={isHover} versionText={versionText} titleText={nameDisplaySingle} tagText={tagText} gender={nd?.gender} birthPlace={nd?.birthPlace} birthDateText={mintedFlag ? birthDateString(nd) : undefined} shortHashText={shortHashText} endorsementCount={endorse} />
                </g>
              )
            })}
          </g>
        </g>
      </svg>
    </div>
  )
}

const MerkleTreeView = forwardRef(MerkleTreeViewInner)
export default MerkleTreeView
