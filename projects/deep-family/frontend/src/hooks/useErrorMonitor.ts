import { useCallback, useRef, useState } from 'react'

export interface CapturedError {
  id: number
  error: any
  message: string
  time: number
  context?: Record<string, any>
}

interface UseErrorMonitorOptions {
  max?: number
  onError?: (err: CapturedError) => void
  dedupeMs?: number
}

export function useErrorMonitor(options?: UseErrorMonitorOptions) {
  const { max = 50, onError, dedupeMs = 800 } = options || {}
  const [errors, setErrors] = useState<CapturedError[]>([])
  const idRef = useRef(1)
  const lastRef = useRef<{ msg: string; time: number } | null>(null)

  const push = useCallback((e: any, context?: Record<string, any>) => {
    const message = e?.message || String(e)
    const now = Date.now()
    if (lastRef.current && lastRef.current.msg === message && now - lastRef.current.time < dedupeMs) return
    lastRef.current = { msg: message, time: now }
    const entry: CapturedError = { id: idRef.current++, error: e, message, time: now, context }
    setErrors(prev => {
      const next = [...prev, entry]
      if (next.length > max) next.shift()
      return next
    })
    onError?.(entry)
  }, [dedupeMs, max, onError])

  const clear = useCallback(() => setErrors([]), [])

  return { errors, push, clear }
}
