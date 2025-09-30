import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
  confirmBtnClassName?: string
}

export default function ConfirmDialog({ open, title, message, confirmText, cancelText, onConfirm, onCancel, confirmBtnClassName }: ConfirmDialogProps) {
  const onKey = useCallback((e: KeyboardEvent) => { if (!open) return; if (e.key === 'Escape') onCancel(); if (e.key === 'Enter') { e.preventDefault(); onConfirm() } }, [open, onCancel, onConfirm])
  useEffect(() => { window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [onKey])
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-lg shadow-xl w-[420px] max-w-[95vw] p-6 transition-colors">
        <button aria-label="close" className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400" onClick={onCancel}><X size={18} /></button>
        {title ? <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3> : null}
        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line mb-5 leading-relaxed">{message}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{cancelText}</button>
          <button onClick={onConfirm} className={"px-4 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:focus:ring-blue-400/40 transition-colors " + (confirmBtnClassName || '')}>{confirmText}</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
