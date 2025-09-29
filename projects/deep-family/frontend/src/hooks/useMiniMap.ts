import { useCallback, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { ZoomTransformState } from './useZoom'

export interface MiniMapNode { id: string; x: number; y: number; w?: number; h?: number }
export interface UseMiniMapOptions {
  width?: number
  height?: number
  shape?: 'rect' | 'circle'
  nodeSize?: number // for circle default radius mapping
}
export interface UseMiniMapArgs {
  nodes: MiniMapNode[]
  transform: ZoomTransformState
  /** Graph extent (in graph coordinates). If not provided it's computed from nodes */
  extent?: { minX: number; maxX: number; minY: number; maxY: number }
  container?: HTMLElement | null
  onCenter: (gx: number, gy: number) => void
}
export interface UseMiniMapReturn {
  miniSvgRef: React.RefObject<SVGSVGElement>
  viewportRef: React.RefObject<SVGRectElement>
  update: () => void
  dims: { w: number; h: number }
}

/** Generic minimap logic (render points & viewport, handle click & drag-to-pan) */
export function useMiniMap({ width = 160, height = 120, shape = 'rect', nodeSize = 3 }: UseMiniMapOptions, { nodes, transform, extent, container, onCenter }: UseMiniMapArgs): UseMiniMapReturn {
  const miniSvgRef = useRef<SVGSVGElement | null>(null)
  const viewportRef = useRef<SVGRectElement | null>(null)
  const dims = { w: width, h: height }
  const graphExtentRef = useRef<{ minX: number; maxX: number; minY: number; maxY: number }>({ minX: 0, maxX: 1, minY: 0, maxY: 1 })
  const mappingRef = useRef<{ scale: number; offsetX: number; offsetY: number; minX: number; minY: number } | null>(null)
  const draggingRef = useRef(false)

  // derive extent if not provided
  useEffect(() => {
    if (extent) { graphExtentRef.current = extent; return }
    if (!nodes.length) return
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    nodes.forEach(n => {
      const w = n.w || 0, h = n.h || 0
      minX = Math.min(minX, n.x)
      maxX = Math.max(maxX, n.x + w)
      minY = Math.min(minY, n.y)
      maxY = Math.max(maxY, n.y + h)
    })
    graphExtentRef.current = { minX, maxX, minY, maxY }
  }, [nodes, extent])

  const updateNodes = useCallback(() => {
    const mini = d3.select(miniSvgRef.current)
    if (mini.empty()) return
    const { minX, maxX, minY, maxY } = graphExtentRef.current
    const gw = maxX - minX || 1
    const gh = maxY - minY || 1
    const scale = Math.min(width / gw, height / gh)
    const offsetX = (width - gw * scale) / 2
    const offsetY = (height - gh * scale) / 2
    mappingRef.current = { scale, offsetX, offsetY, minX, minY }
    if (shape === 'circle') {
      const sel = mini.select('g.nodes').selectAll('circle').data(nodes, (d: any) => d.id)
      sel.enter().append('circle').attr('r', nodeSize).attr('fill', '#6366f1')
      sel.attr('cx', (d: any) => offsetX + (d.x - minX) * scale).attr('cy', (d: any) => offsetY + (d.y - minY) * scale)
      sel.exit().remove()
    } else {
      const sel = mini.select('g.nodes').selectAll('rect').data(nodes, (d: any) => d.id)
      sel.enter().append('rect').attr('width', nodeSize).attr('height', nodeSize).attr('rx', 1).attr('fill', '#6366f1')
      sel.attr('x', (d: any) => offsetX + (d.x - minX) * scale).attr('y', (d: any) => offsetY + (d.y - minY) * scale)
      sel.exit().remove()
    }
    // viewport rectangle
    const vb = container?.getBoundingClientRect(); if (!vb) return
    const k = transform.k
    const vx0 = -transform.x / k
    const vy0 = -transform.y / k
    const vw = vb.width / k
    const vh = vb.height / k
    const rx = offsetX + (vx0 - minX) * scale
    const ry = offsetY + (vy0 - minY) * scale
    const rw = vw * scale
    const rh = vh * scale
    d3.select(viewportRef.current).attr('x', rx).attr('y', ry).attr('width', rw).attr('height', rh)
  }, [nodes, transform, container, width, height, shape, nodeSize])

  const applyPointerToCenter = useCallback((clientX: number, clientY: number) => {
    const rect = miniSvgRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const map = mappingRef.current
    if (!map) return
    
    const { scale, offsetX, offsetY, minX, minY } = map
    const mx = clientX - rect.left
    const my = clientY - rect.top
    const gx = (mx - offsetX) / scale + minX
    const gy = (my - offsetY) / scale + minY
    
    onCenter(gx, gy)
  }, [onCenter])

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => { applyPointerToCenter(e.clientX, e.clientY) }, [applyPointerToCenter])

  // drag viewport
  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return
    const onDown = (e: PointerEvent) => { 
      e.preventDefault()
      e.stopPropagation()
      draggingRef.current = true
      applyPointerToCenter(e.clientX, e.clientY)
      window.addEventListener('pointermove', onMove, { passive: false })
      window.addEventListener('pointerup', onUp, { passive: false })
    }
    const onMove = (e: PointerEvent) => { 
      if (!draggingRef.current) return
      e.preventDefault()
      applyPointerToCenter(e.clientX, e.clientY) 
    }
    const onUp = (e: PointerEvent) => { 
      e.preventDefault()
      draggingRef.current = false
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp) 
    }
    vp.addEventListener('pointerdown', onDown, { passive: false })
    return () => { 
      vp.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp) 
    }
  }, [applyPointerToCenter])

  // update on transform & nodes change
  useEffect(() => { updateNodes() }, [transform, updateNodes])
  useEffect(() => { updateNodes() }, [nodes, updateNodes])

  // ensure groups exist
  useEffect(() => { const mini = d3.select(miniSvgRef.current); if (mini.select('g.nodes').empty()) mini.append('g').attr('class', 'nodes') }, [])

  // attach click on svg (drag handled separately)
  useEffect(() => { 
    const svg = miniSvgRef.current
    if (!svg) return
    const clickHandler = (e: any) => {
      e.preventDefault()
      e.stopPropagation()
      if (!draggingRef.current) handleClick(e)
    }
    svg.addEventListener('click', clickHandler, { passive: false })
    return () => svg.removeEventListener('click', clickHandler)
  }, [handleClick])

  return { miniSvgRef, viewportRef, update: updateNodes, dims }
}

export default useMiniMap
