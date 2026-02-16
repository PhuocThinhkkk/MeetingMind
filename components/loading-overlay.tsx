'use client'

import { UploadState } from '@/hooks/use-upload-controller'
import { createPortal } from 'react-dom'


interface LoadingOverlayProps {
  state: UploadState
  message?: string
  errorMessage?: string
  onRetry?: () => void
  onDismiss?: () => void
}

export function LoadingOverlay({
  state,
  message = 'Please wait...',
  errorMessage = 'Something went wrong.',
  onRetry,
  onDismiss,
}: LoadingOverlayProps) {
  if (state === 'idle') return null

  return createPortal(
    <>
      {state === 'uploading' && (
        <>
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9998]" />

          <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <div className="flex flex-col items-center gap-4">
              {/* Spinner */}
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-white/30" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
              </div>

              <p className="text-base text-slate-700 font-medium text-center">
                {message}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Error / Retry State */}
      {state === 'error' && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-[9998]"
            onClick={onDismiss}
          />

          <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4 space-y-4">
              <p className="text-base text-slate-700 font-medium text-center">
                {errorMessage}
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={onDismiss}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg"
                >
                  Dismiss
                </button>

                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  )
}
