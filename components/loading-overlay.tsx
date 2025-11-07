"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  isLoading: boolean
  message: string
  isRetry?: boolean
  retryMessage?: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function LoadingOverlay({
  isLoading,
  message,
  isRetry = false,
  retryMessage,
  onRetry,
  onDismiss,
}: LoadingOverlayProps) {
  const [show, setShow] = useState(isLoading)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isLoading) {
      setShow(true)
    } else if (isRetry) {
      setShow(true)
    } else {
      const timer = setTimeout(() => setShow(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading, isRetry])

  if (!mounted || !show) return null

  return createPortal(
    <>
      {/* Loading state: full overlay with blur */}
      {isLoading && (
        <>
          <div
            className={cn(
              "fixed inset-0 bg-white/80 backdrop-blur-sm z-[9998] transition-opacity duration-300",
              "opacity-100",
            )}
          />

          <div
            className={cn(
              "fixed inset-0 flex items-center justify-center z-[9999] transition-opacity duration-300",
              "opacity-100",
            )}
          >
            <div className="flex flex-col items-center gap-4">
              {/* Spinner */}
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-white/30" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
              </div>

              {/* Message */}
              <p className="text-base text-slate-700 font-medium text-balance">{message}</p>
            </div>
          </div>
        </>
      )}

      {isRetry && (
        <>
          {/* Subtle backdrop */}
          <div className="fixed inset-0 bg-black/20 z-[9998] transition-opacity duration-300" onClick={onDismiss} />

          {/* Modal dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] transition-opacity duration-300">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4 space-y-4">
              <p className="text-base text-slate-700 font-medium text-center text-balance">
                {retryMessage || message || "Something went wrong."}
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={onDismiss}
                  className="hover:cursor-pointer px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-all"
                >
                  Dismiss
                </button>
                <button
                  onClick={onRetry}
                  className="hover:cursor-pointer px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>,
    document.body,
  )
}

