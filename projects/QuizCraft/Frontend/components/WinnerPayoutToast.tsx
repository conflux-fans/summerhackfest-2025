"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Trophy, CheckCircle, XCircle, ExternalLink, Sparkles, Coins, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface WinnerPayoutToastProps {
  type: 'success' | 'error'
  title?: string
  description?: string
  transactionHash?: string
  prizeAmount?: string
  winnerAddress?: string
  errorMessage?: string
  className?: string
  onViewTransaction?: () => void
  onClose?: () => void
}

export function WinnerPayoutToast({
  type,
  title,
  description,
  transactionHash,
  prizeAmount,
  winnerAddress,
  errorMessage,
  className,
  onViewTransaction,
  onClose
}: WinnerPayoutToastProps) {
  const [isVisible, setIsVisible] = React.useState(true)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 8000) // Auto-hide after 8 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible || !isMounted) return null

  const isSuccess = type === 'success'
  const isError = type === 'error'

  // Safety check for SSR
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className={cn(
        "fixed top-4 right-4 z-[99999] max-w-md w-full",
        "transform transition-all duration-500 ease-out",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        className
      )}
      style={{ zIndex: 99999 }}
    >
      <div className={cn(
        "relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-sm",
        "pointer-events-auto",
        isSuccess && "border-amber-200/50 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50",
        isError && "border-red-200/50 bg-gradient-to-br from-red-50 via-rose-50 to-pink-50"
      )}>
        {/* Animated background gradient */}
        <div className={cn(
          "absolute inset-0",
          isSuccess && "bg-gradient-to-r from-amber-400/10 via-yellow-400/10 to-orange-400/10 animate-gradient",
          isError && "bg-gradient-to-r from-red-400/10 via-rose-400/10 to-pink-400/10 animate-gradient"
        )} />
        
        {/* Close button */}
        <button
          onClick={() => {
            setIsVisible(false)
            onClose?.()
          }}
          className={cn(
            "absolute top-3 right-3 z-10 rounded-full p-1.5 transition-all duration-200",
            "hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-current/20",
            isSuccess && "text-amber-600 hover:text-amber-800",
            isError && "text-red-600 hover:text-red-800"
          )}
          aria-label="Close toast"
        >
          <X className="h-4 w-4" />
        </button>
        
        {/* Icon effects */}
        <div className="absolute top-2 right-12">
          {isSuccess && <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />}
          {isError && <XCircle className="h-4 w-4 text-red-500 animate-pulse" />}
        </div>
        
        <div className="relative p-6">
          {/* Header with icon */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
                isSuccess && "bg-gradient-to-br from-amber-400 to-orange-500",
                isError && "bg-gradient-to-br from-red-400 to-rose-500"
              )}>
                {isSuccess && <Trophy className="h-6 w-6 text-white" />}
                {isError && <XCircle className="h-6 w-6 text-white" />}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-lg font-bold mb-1",
                isSuccess && "text-amber-900",
                isError && "text-red-900"
              )}>
                {title || (isSuccess ? "🏆 Prize Resolved Successfully!" : "❌ Prize Resolution Failed")}
              </h3>
              
              {(description || errorMessage) && (
                <p className={cn(
                  "text-sm mb-3 leading-relaxed",
                  isSuccess && "text-amber-800",
                  isError && "text-red-800"
                )}>
                  {description || errorMessage}
                </p>
              )}
              
              {/* Winner info - only for success */}
              {isSuccess && winnerAddress && (
                <div className="mb-3 p-2 bg-white/60 rounded-lg border border-amber-200/50">
                  <p className="text-xs font-medium text-amber-700 mb-1">Winner:</p>
                  <p className="text-xs font-mono text-amber-800 break-all">
                    {winnerAddress.slice(0, 6)}...{winnerAddress.slice(-4)}
                  </p>
                </div>
              )}
              
              {/* Prize amount - only for success */}
              {isSuccess && prizeAmount && (
                <div className="mb-3 p-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg border border-amber-300/50">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-xs font-medium text-amber-700">Prize Amount:</p>
                      <p className="text-sm font-bold text-amber-900">
                        {prizeAmount} CFX
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Transaction info - only for success */}
              {isSuccess && transactionHash && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-amber-700">
                      Transaction: {transactionHash.slice(0, 10)}...
                    </span>
                  </div>
                  
                  {onViewTransaction && (
                    <button
                      onClick={onViewTransaction}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-amber-800 bg-white/80 hover:bg-white border border-amber-300/50 rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>View</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1",
          isSuccess && "bg-amber-200/30",
          isError && "bg-red-200/30"
        )}>
          <div className={cn(
            "h-full animate-pulse",
            isSuccess && "bg-gradient-to-r from-amber-400 to-orange-500",
            isError && "bg-gradient-to-r from-red-400 to-rose-500"
          )} />
        </div>
      </div>
    </div>,
    document.body
  )
}

// Hook for easy usage
export function useWinnerPayoutToast() {
  const [toast, setToast] = React.useState<WinnerPayoutToastProps | null>(null)

  const showSuccessToast = (props: Omit<WinnerPayoutToastProps, 'type'>) => {
    setToast({ ...props, type: 'success' })
  }

  const showErrorToast = (props: Omit<WinnerPayoutToastProps, 'type'>) => {
    setToast({ ...props, type: 'error' })
  }

  const hideToast = () => {
    setToast(null)
  }

  const ToastComponent = toast ? (
    <WinnerPayoutToast
      {...toast}
      onViewTransaction={() => {
        if (toast.transactionHash) {
          window.open(`https://evmtestnet.confluxscan.org/tx/${toast.transactionHash}`, '_blank')
        }
      }}
      onClose={hideToast}
    />
  ) : null

  return {
    showSuccessToast,
    showErrorToast,
    hideToast,
    WinnerToast: ToastComponent
  }
}
