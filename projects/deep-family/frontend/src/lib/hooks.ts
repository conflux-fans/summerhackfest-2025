import { useRef } from 'react'

export function useLongPress(callback: () => void, ms: number = 500) {
  const timer = useRef<number | null>(null)

  const start = () => {
    clear()
    timer.current = window.setTimeout(() => {
      callback()
      clear()
    }, ms)
  }

  const clear = () => {
    if (timer.current) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  }
}


