'use client'

import { useEffect, useRef } from 'react'

interface RenderDebuggerProps {
  componentName: string
  props?: Record<string, any>
}

export default function RenderDebugger({ componentName, props }: RenderDebuggerProps) {
  const renderCount = useRef(0)
  const prevProps = useRef(props)
  
  useEffect(() => {
    renderCount.current += 1
    console.log(`🔄 ${componentName} rendered ${renderCount.current} times`)
    
    if (props && prevProps.current) {
      const changedProps = Object.keys(props).filter(
        key => props[key] !== prevProps.current[key]
      )
      if (changedProps.length > 0) {
        console.log(`📝 ${componentName} props changed:`, changedProps)
      }
    }
    
    prevProps.current = props
  })
  
  return null
}
