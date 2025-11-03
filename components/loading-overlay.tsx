"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  isLoading: boolean
  message: string
}

export function LoadingOverlay({ isLoading, message }: LoadingOverlayProps) {
  const [show, setShow] = useState(isLoading)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isLoading) {
      setShow(true)
    } else {
      // Allow fade-out animation to complete
      const timer = setTimeout(() => setShow(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!mounted || !show) return null

  return createPortal(
    <>
      <div
        className={cn(
          "fixed inset-0 bg-white/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isLoading ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        className={cn(
          "fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300",
          isLoading ? "opacity-100" : "opacity-0",
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
    </>,
    document.body,
  )
}

