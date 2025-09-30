import { useEffect, useRef } from 'react'

export function useDebounce<T>(value: T, delay: number, effect: (v: T) => void) {
  const timeoutRef = useRef<number | undefined>(undefined)
  const latest = useRef(value)
  useEffect(() => { latest.current = value }, [value])
  useEffect(() => {
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      if (latest.current === value) effect(value)
    }, delay)
    return () => window.clearTimeout(timeoutRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay])
}
