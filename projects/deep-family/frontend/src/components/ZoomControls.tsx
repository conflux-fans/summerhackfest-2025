import React, { useCallback, useEffect, useRef } from 'react'

export interface ZoomControlsProps {
  k: number
  kToNorm: (k: number) => number
  normToK: (n: number) => number
  onSetZoom: (k: number) => void
  onZoomIn: () => void
  onZoomOut: () => void
  className?: string
  trackHeight?: number
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ k, kToNorm, normToK, onSetZoom, onZoomIn, onZoomOut, className = '', trackHeight = 220 }) => {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)

  const handlePointerPos = useCallback((clientY: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    let y = clientY - rect.top
    y = Math.max(0, Math.min(rect.height, y))
    const norm = 1 - y / rect.height
    onSetZoom(normToK(norm))
  }, [normToK, onSetZoom])

  const onPointerMove = useCallback((e: PointerEvent) => { 
    if (draggingRef.current) {
      e.preventDefault()
      handlePointerPos(e.clientY)
    }
  }, [handlePointerPos])
  const onPointerUp = useCallback((e: PointerEvent) => { 
    e.preventDefault()
    draggingRef.current = false
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp) 
  }, [onPointerMove])
  const onPointerDown = useCallback((e: React.PointerEvent) => { 
    e.preventDefault()
    e.stopPropagation()
    draggingRef.current = true
    handlePointerPos(e.clientY)
    window.addEventListener('pointermove', onPointerMove, { passive: false })
    window.addEventListener('pointerup', onPointerUp, { passive: false })
  }, [handlePointerPos, onPointerMove, onPointerUp])
  useEffect(() => () => { window.removeEventListener('pointermove', onPointerMove); window.removeEventListener('pointerup', onPointerUp) }, [onPointerMove, onPointerUp])

  return (
    <div className={`flex flex-col items-center gap-3 select-none ${className}`}>
      <button 
        onClick={onZoomIn} 
        onPointerDown={(e) => { e.stopPropagation() }}
        onTouchStart={(e) => { e.stopPropagation() }}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-lg border border-slate-200/60 dark:border-slate-600/60 hover:bg-blue-50 dark:hover:bg-slate-700/80 active:scale-95 transition-all duration-200 text-slate-700 dark:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:focus-visible:ring-blue-400/60 backdrop-blur-sm hover:shadow-xl font-semibold text-lg"
        style={{ touchAction: 'manipulation', userSelect: 'none' }}
      >+</button>
      <div 
        ref={trackRef} 
        onPointerDown={onPointerDown}
        onMouseDown={(e) => {
          // Fallback for environments where pointer events might not work
          const pointerEvent = new PointerEvent('pointerdown', {
            clientX: e.clientX,
            clientY: e.clientY,
            button: e.button,
            buttons: e.buttons
          })
          onPointerDown(pointerEvent as any)
        }}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            const touch = e.touches[0]
            const pointerEvent = new PointerEvent('pointerdown', {
              clientX: touch.clientX,
              clientY: touch.clientY
            })
            onPointerDown(pointerEvent as any)
          }
        }}
        className="relative w-6" 
        style={{ height: trackHeight, touchAction: 'none', userSelect: 'none' }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-1.5 bottom-1.5 w-1.5 rounded-full bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 shadow-inner backdrop-blur-sm">
          <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg ring-2 ring-white dark:ring-slate-800 hover:scale-110 transition-all duration-200 cursor-grab active:cursor-grabbing" style={{ top: `${(1 - kToNorm(k)) * 100}%`, transform: 'translate(-50%, -50%)' }} />
          <div className="absolute left-1/2 -translate-x-1/2 w-1.5 bg-gradient-to-t from-blue-400/80 to-indigo-400/60 dark:from-blue-500/70 dark:to-indigo-500/50" style={{ top: `${(1 - kToNorm(k)) * 100}%`, bottom: 0, borderRadius: '999px' }} />
        </div>
      </div>
      <button 
        onClick={onZoomOut} 
        onPointerDown={(e) => { e.stopPropagation() }}
        onTouchStart={(e) => { e.stopPropagation() }}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-lg border border-slate-200/60 dark:border-slate-600/60 hover:bg-blue-50 dark:hover:bg-slate-700/80 active:scale-95 transition-all duration-200 text-slate-700 dark:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:focus-visible:ring-blue-400/60 backdrop-blur-sm hover:shadow-xl font-semibold text-lg"
        style={{ touchAction: 'manipulation', userSelect: 'none' }}
      >-</button>
    </div>
  )
}

export interface MiniMapProps {
  width: number
  height: number
  miniSvgRef: React.RefObject<SVGSVGElement>
  viewportRef: React.RefObject<SVGRectElement>
  onClick?: (e: React.MouseEvent<SVGSVGElement>) => void
  className?: string
  children?: React.ReactNode
}

export const MiniMap: React.FC<MiniMapProps> = ({ width, height, miniSvgRef, viewportRef, onClick, className = '', children }) => {
  return (
    <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-600/60 p-1.5 select-none transition-all duration-200 hover:shadow-xl ${className}`}>      
      <svg ref={miniSvgRef} width={width} height={height} onClick={onClick} className="cursor-pointer">
        <rect x={0} y={0} width={width} height={height} rx={6} ry={6} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" className="dark:fill-slate-800 dark:stroke-slate-600" />
        <g className="nodes" />
        <rect ref={viewportRef} x={0} y={0} width={20} height={20} fill="none" stroke="#3b82f6" strokeWidth={2} rx={2} ry={2} className="dark:stroke-blue-400" />
        {children}
      </svg>
    </div>
  )
}

export default ZoomControls
