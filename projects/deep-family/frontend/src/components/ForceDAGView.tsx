import React, { useEffect, useMemo, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import * as d3 from 'd3'
import type { GraphNode } from '../types/graph'
import { makeNodeId, nodeLabel, isMinted, shortHash } from '../types/graph'
import { useTreeData } from '../context/TreeDataContext'
import { useNodeDetail } from '../context/NodeDetailContext'
import useZoom from '../hooks/useZoom'
import useMiniMap from '../hooks/useMiniMap'
import { ZoomControls, MiniMap } from './ZoomControls'
import { useFamilyTreeHeight } from '../constants/layout'

// Re-add types lost during refactor
export type SimNode = d3.SimulationNodeDatum & { id: string; label: string; hash: string; versionIndex: number; tag?: string; depth: number }
export type SimLink = d3.SimulationLinkDatum<SimNode> & { source: string | SimNode; target: string | SimNode }

function buildGraph(root: GraphNode) {
  const nodes: SimNode[] = []
  const links: SimLink[] = []
  function rec(n: GraphNode, depth: number) {
    const id = makeNodeId(n.personHash, n.versionIndex)
    nodes.push({ id, label: nodeLabel(n), hash: n.personHash, versionIndex: n.versionIndex, tag: n.tag, depth })
    for (const c of n.children || []) { const cid = makeNodeId(c.personHash, c.versionIndex); links.push({ source: id, target: cid }); rec(c, depth + 1) }
  }
  rec(root, 0)
  return { nodes, links }
}

export interface ForceDAGViewHandle { centerOnNode: (id: string) => void }

function ForceDAGViewInner({ root, height }: { root: GraphNode; height?: number }, ref: React.Ref<ForceDAGViewHandle>) {
  const responsiveHeight = useFamilyTreeHeight()
  const defaultHeight = height || responsiveHeight
  const { nodesData } = useTreeData() as any
  const { openNode, selected: ctxSelected } = useNodeDetail()
  const selectedId = ctxSelected ? makeNodeId(ctxSelected.personHash, ctxSelected.versionIndex) : null
  const data = useMemo(() => buildGraph(root), [root])
  const gRef = useRef<SVGGElement | null>(null)
  const { transform, zoomIn, zoomOut, setZoom, svgRef, innerRef, kToNorm, normToK, centerOn } = useZoom()
  const NODE_R = 14
  const containerRef = useRef<HTMLDivElement | null>(null)

  useImperativeHandle(ref, () => ({
    centerOnNode: (id: string) => {
      let target: any = null
      if (gRef.current) { d3.select(gRef.current).selectAll('g').each(function(d: any) { if (d?.id === id) target = d }) }
      if (!target || typeof target.x !== 'number' || typeof target.y !== 'number') return
      const box = containerRef.current?.getBoundingClientRect(); if (!box) return
      centerOn(target.x, target.y, box.width, box.height)
    }
  }), [centerOn])

  useEffect(() => {
    if (!svgRef.current || !innerRef.current) return
    const svg = d3.select(svgRef.current)
    // Only clear inner group; keep defs etc.
    const g = d3.select(innerRef.current)
    g.selectAll('*').remove()
    gRef.current = g.node() as SVGGElement
    const width = (svgRef.current?.clientWidth || 800)

    // Ensure marker defs exist once
    let defs = svg.select<SVGDefsElement>('defs')
    if (defs.empty()) defs = svg.append('defs')
    const markerSel = defs.select('#fd-arrow')
    if (markerSel.empty()) {
      const m = defs.append('marker')
        .attr('id', 'fd-arrow')
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 10)
        .attr('refY', 5)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto-start-reverse')
      m.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z').attr('fill', '#60a5fa')
    }

    const link = g.append('g').attr('stroke', '#93c5fd').attr('stroke-width', 2).attr('stroke-opacity', 0.7).selectAll('line').data(data.links).enter().append('line').attr('marker-end', 'url(#fd-arrow)')

    const node = g.append('g').selectAll('g').data(data.nodes).enter().append('g').call(d3.drag<SVGGElement, SimNode>()
      .on('start', (event: any, d: SimNode) => { if (!event.active) simulation.alphaTarget(0.3).restart(); (d as any).fx = d.x; (d as any).fy = d.y })
      .on('drag', (event: any, d: SimNode) => { (d as any).fx = event.x; (d as any).fy = event.y })
      .on('end', (_event: any, d: SimNode) => { (d as any).fx = null; (d as any).fy = null; simulation.alphaTarget(0) })
    )

    const color = d3.scaleOrdinal(d3.schemeTableau10)
    node.append('circle').attr('r', NODE_R)
      .attr('fill', (d: any) => {
        const id = (d as SimNode).id
        return id === selectedId ? '#fde68a' : (color((d as SimNode).depth.toString()) as string)
      })
      .attr('stroke', (d: any) => {
        const id = (d as SimNode).id
        const nd = nodesData?.[id]
        return isMinted(nd) ? '#059669' : (id === selectedId ? '#f59e0b' : '#6366f1')
      })
      .attr('stroke-width', (d: any) => {
        const id = (d as SimNode).id
        return isMinted(nodesData?.[id]) ? 2 : (id === selectedId ? 2 : 1)
      }).attr('opacity', 0.95)

    const isDark = document.documentElement.classList.contains('dark')
    const strokeColor = isDark ? '#0f172a' : '#ffffff'
    node.append('circle')
      .attr('r', 4)
      .attr('cx', NODE_R - 6)
      .attr('cy', -(NODE_R - 6))
      .attr('fill', (d: any) => {
        const id = (d as SimNode).id
        const nd = nodesData?.[id]
        const g = nd?.gender as number | undefined
        return g === 1 ? '#0ea5e9' : (g === 2 ? '#f43f5e' : (g === 3 ? '#8b5cf6' : '#94a3b8'))
      })
      .attr('stroke', strokeColor)
      .attr('stroke-width', 1)

    node.append('title').text((d: any) => (d as SimNode).hash)
    const lbl = node.append('text').attr('class', 'font-mono').attr('fill', '#0f172a')
    lbl.each((d: any, i: number, nodesSel: any) => {
      const gtxt = d3.select(nodesSel[i])
      const sim = d as SimNode
      const id = sim.id
      const nd = nodesData?.[id]
      const mintedFlag = isMinted(nd)
      const shortHashText = shortHash(sim.hash)
      const width = 60
      gtxt.append('tspan').attr('x', 18).attr('y', -3).attr('font-size', 11).attr('fill', mintedFlag ? '#047857' : '#6366f1').text(shortHashText)
      gtxt.append('tspan').attr('x', 20 + width).attr('y', -3).attr('text-anchor', 'end').attr('font-size', 11).attr('fill', mintedFlag ? '#059669' : '#6366f1').text(`v${sim.versionIndex}`)
      const nm = nd?.fullName
      if (nm) gtxt.append('tspan').attr('x', 18).attr('y', 12).attr('font-size', 11).attr('fill', mintedFlag ? '#047857' : '#6366f1').text(nm)
    })

    node.append('text').attr('class', 'endorse-count').attr('text-anchor', 'middle').attr('dy', '0.35em').attr('font-size', 10)
      .attr('fill', '#ffffff')
      .text((d: any) => { const ndLocal = nodesData?.[(d as SimNode).id]; const val = ndLocal?.endorsementCount; return val === undefined ? '' : String(val) })

    node.on('click', (_e: any, d: any) => { const sim = d as SimNode; openNode({ personHash: sim.hash, versionIndex: sim.versionIndex}) })
    node.on('dblclick', (_e: any, d: any) => { navigator.clipboard?.writeText((d as SimNode).hash).catch(() => {}) })

    const SPEED = { charge: -180, linkDist: 90, linkStrength: 0.95, xStrength: 0.7, yStrength: 0.15, collidePad: 2, velocityDecay: 0.25, alpha: 1, alphaDecay: 0.015 }
    const gapX = 80
    const marginX = 30
    const simulation = d3.forceSimulation<SimNode>(data.nodes)
      .velocityDecay(SPEED.velocityDecay)
      .alpha(SPEED.alpha)
      .alphaDecay(SPEED.alphaDecay)
      .force('link', d3.forceLink<SimNode, SimLink>(data.links).id((d: any) => (d as SimNode).id).distance(SPEED.linkDist).strength(SPEED.linkStrength))
      .force('charge', d3.forceManyBody().strength(SPEED.charge))
      .force('x', d3.forceX<SimNode>().x((d: any) => marginX + (d as SimNode).depth * gapX).strength(SPEED.xStrength))
      .force('y', d3.forceY(defaultHeight / 2).strength(SPEED.yStrength))
      .force('collide', d3.forceCollide<SimNode>(NODE_R + SPEED.collidePad))
      .on('tick', () => {
        link.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y).attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y)
        node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
        miniUpdateRef.current && miniUpdateRef.current()
      })

    return () => { simulation.stop() }
  }, [data, height, openNode, selectedId, innerRef, svgRef, nodesData])

  const [miniNodes, setMiniNodes] = useState<any[]>([])
  const miniUpdateRef = useRef<()=>void>()
  const refreshMiniNodes = useCallback(() => {
    const arr: any[] = []
    if (gRef.current) d3.select(gRef.current).selectAll('g').each(function(d: any) { if (d && typeof d.x === 'number' && typeof d.y === 'number') arr.push({ id: d.id, x: d.x, y: d.y }) })
    setMiniNodes(arr)
  }, [])
  useEffect(() => { const id = setInterval(refreshMiniNodes, 500); return () => clearInterval(id) }, [refreshMiniNodes])
  const { miniSvgRef, viewportRef, dims, update } = useMiniMap({ shape: 'circle' }, { nodes: miniNodes, transform, container: containerRef.current, onCenter: (gx, gy) => {
    const box = containerRef.current?.getBoundingClientRect(); if (!box) return
    centerOn(gx, gy, box.width, box.height)
  } })
  miniUpdateRef.current = update

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-900/90 dark:via-slate-800/60 dark:to-slate-900/90 rounded-2xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 shadow-xl backdrop-blur-sm pt-16"
      style={{ height: defaultHeight, touchAction: 'none', overscrollBehavior: 'contain' }}
    >
      <div className="absolute bottom-3 right-3 z-10"><MiniMap width={dims.w} height={dims.h} miniSvgRef={miniSvgRef} viewportRef={viewportRef} /></div>
      <ZoomControls className="absolute top-20 right-3 z-10" k={transform.k} kToNorm={kToNorm} normToK={normToK} onSetZoom={setZoom} onZoomIn={zoomIn} onZoomOut={zoomOut} />
      <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 800 ${defaultHeight}`} className="block min-w-full min-h-full select-none" style={{ touchAction: 'none' }}>
        <g ref={innerRef as any} />
      </svg>
    </div>
  )
}

const ForceDAGView = forwardRef(ForceDAGViewInner)
export default ForceDAGView
