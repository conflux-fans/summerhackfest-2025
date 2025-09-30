import { useLayoutEffect, useRef, useState, useEffect, useCallback } from 'react'

export type ViewMode = 'tree' | 'dag' | 'force' | 'virtual'

interface ViewModeSwitchProps {
  value: ViewMode
  onChange: (m: ViewMode) => void
  labels: { tree: string; dag: string; force: string; virtual: string }
  disabled?: boolean
}

const order: ViewMode[] = ['tree', 'dag', 'force', 'virtual']

export default function ViewModeSwitch({ value, onChange, labels, disabled }: ViewModeSwitchProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const btnRefs = useRef<HTMLButtonElement[]>([])
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const [animate, setAnimate] = useState(true)

  const measure = useCallback(() => {
    const idx = order.indexOf(value)
    const btn = btnRefs.current[idx]
    const container = containerRef.current
    if (!btn || !container) return
    const left = btn.offsetLeft
    const width = btn.offsetWidth
    setIndicator(prev => (prev.left !== left || prev.width !== width ? { left, width } : prev))
  }, [value])

  useLayoutEffect(() => {
    setAnimate(true)
    measure()
  }, [value, measure])

  useLayoutEffect(() => {
    setAnimate(false)
    measure()
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [labels.tree, labels.dag, labels.force, labels.virtual, measure])

  useEffect(() => {
    const ro = new ResizeObserver(() => { setAnimate(false); measure(); requestAnimationFrame(() => setAnimate(true)) })
    if (containerRef.current) ro.observe(containerRef.current)
    btnRefs.current.forEach(b => b && ro.observe(b))
    const onResize = () => { setAnimate(false); measure(); requestAnimationFrame(() => setAnimate(true)) }
    window.addEventListener('resize', onResize)
    if ((document as any).fonts?.ready) {
      ;(document as any).fonts.ready.then(() => { setAnimate(false); measure(); requestAnimationFrame(() => setAnimate(true)) }).catch(() => {})
    }
    return () => { ro.disconnect(); window.removeEventListener('resize', onResize) }
  }, [measure])


  return (
    <div
      ref={containerRef}
      className="relative inline-flex h-10 select-none rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs font-medium overflow-hidden shadow-sm p-0 max-w-full"
    >
      <div
        className={`absolute rounded-lg bg-indigo-600 ${animate ? 'transition-all duration-200 ease-out' : ''} z-0`}
        style={{ top: 2, bottom: 2, left: indicator.left + 2, width: indicator.width - 4 }}
      />
      {order.map((m, idx) => (
        <button
          key={m}
          ref={el => { if (el) btnRefs.current[idx] = el }}
          type="button"
          disabled={disabled}
          onClick={() => onChange(m)}
          className={`relative z-10 inline-flex items-center justify-center gap-1 px-2 h-full min-h-[40px] transition-colors duration-150 focus:outline-none text-[10px] flex-shrink min-w-0 touch-manipulation whitespace-nowrap ${value === m ? 'text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'}`}
        >
          {m === 'tree' && (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v6" />
              <path d="M6 18h12" />
              <path d="M6 21v-6a6 6 0 0 1 12 0v6" />
            </svg>
          )}
          {m === 'dag' && (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="5" r="2"/>
              <circle cx="19" cy="5" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="5" cy="19" r="2"/>
              <circle cx="19" cy="19" r="2"/>
              <path d="M7 5h10"/>
              <path d="M6.5 6.5l3.5 3.5"/>
              <path d="M17.5 6.5L14 10"/>
              <path d="M12 14v3"/>
              <path d="M7 19h10"/>
            </svg>
          )}
          {m === 'force' && (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4"/>
              <path d="M12 18v4"/>
              <path d="M2 12h4"/>
              <path d="M18 12h4"/>
              <path d="M5.6 5.6l2.8 2.8"/>
              <path d="M15.6 15.6l2.8 2.8"/>
              <path d="M18.4 5.6l-2.8 2.8"/>
              <path d="M8.4 15.6l-2.8 2.8"/>
            </svg>
          )}
          {m === 'virtual' && (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="7" height="6" rx="1"/>
              <rect x="14" y="4" width="7" height="6" rx="1"/>
              <rect x="3" y="14" width="7" height="6" rx="1"/>
              <rect x="14" y="14" width="7" height="6" rx="1"/>
            </svg>
          )}
          <span className="hidden lg:inline whitespace-nowrap">{labels[m]}</span>
          <span className="lg:hidden whitespace-nowrap">{labels[m]}</span>
        </button>
      ))}
    </div>
  )
}
