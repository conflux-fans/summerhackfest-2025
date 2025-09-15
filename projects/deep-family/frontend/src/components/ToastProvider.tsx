import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

type Toast = { id: number; message: string }

type ToastContextType = {
  show: (message: string, durationMs?: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const show = useCallback((message: string, durationMs: number = 1800) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts(t => [...t, { id, message }])
    window.setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), durationMs)
  }, [])

  const value = useMemo<ToastContextType>(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* portal-like container */}
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center pointer-events-none">
        <div className="space-y-2">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto mx-auto max-w-md rounded-md border border-gray-200 bg-white shadow px-3 py-2 text-sm text-gray-800">
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}


