import { useCallback, useEffect, useRef } from 'react'

import { useAuth } from '@/hooks/use-auth'
import { log } from '@/utils/logger'
import {
  RealtimeTranscriptResponse,
  RealtimeTranslateResponse,
} from '@/types/transcriptions/transcription.ws'

type RecorderWebSocketHandlers = {
  onReady?: () => void
  onTranscript?: (response: RealtimeTranscriptResponse) => void
  onTranslate?: (response: RealtimeTranslateResponse) => void
  onOpen?: () => void
  onError?: (error: Event) => void
  onClose?: (event: CloseEvent) => void
}

/**
 * Manages a WebSocket connection for real-time transcription and translation.
 *
 * @param handlers - Optional callbacks for connection lifecycle and received messages.
 * @returns WebSocket state and controls for building the connection URL, connecting, disconnecting, and sending data.
 */
export function useRecorderWebSocket(handlers: RecorderWebSocketHandlers = {}) {
  const { session } = useAuth()
  const wsRef = useRef<WebSocket | null>(null)
  const isAssemblyReady = useRef(false)
  const handlersRef = useRef<RecorderWebSocketHandlers>(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  const getWsUrl = useCallback((): string => {
    let wsDomain = process.env.NEXT_PUBLIC_WS_SERVER_URL || 'localhost:9090'

    wsDomain = wsDomain.replace(/^wss?:\/\//, '')
    if (!session?.access_token) {
      throw new Error(`No access token found in session. ${session}`)
    }

    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    return `${protocol}://${wsDomain}/ws?token=${session?.access_token}`
  }, [session])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    isAssemblyReady.current = false
  }, [])

  const connect = useCallback((wsUrl: string) => {
    try {
      wsRef.current = new WebSocket(wsUrl)

      if (!wsRef?.current) {
        log.info('no ws current yet.')
        return
      }

      wsRef.current.onopen = () => {
        log.info('WebSocket connected')
        handlersRef.current.onOpen?.()
      }

      wsRef.current.onerror = error => {
        log.error('WebSocket error:', error)
        handlersRef.current.onError?.(error)
      }

      wsRef.current.onclose = event => {
        log.info(`WebSocket disconnected ${event.reason}`, event.code)
        handlersRef.current.onClose?.(event)
      }

      wsRef.current.onmessage = event => {
        try {
          const res = JSON.parse(event.data)

          if (res.type === 'ready') {
            log.info('Assembly is ready!')
            isAssemblyReady.current = true
            handlersRef.current.onReady?.()
            return
          }

          if (res.type === 'transcript') {
            log.info('Received transcription response:', res)
            handlersRef.current.onTranscript?.(
              res as RealtimeTranscriptResponse
            )
            return
          }

          if (res.type === 'translate') {
            log.info('Received translation response:', res)
            handlersRef.current.onTranslate?.(res as RealtimeTranslateResponse)
            return
          }

          log.error('Unknown response :', res)
        } catch (error) {
          log.error('Error parsing WebSocket message:', error)
        }
      }
    } catch (error) {
      log.error('Failed to connect WebSocket:', error)
      handlersRef.current.onError?.(error as Event)
    }
  }, [])

  const send = useCallback(
    (data: ArrayBufferLike | Blob | ArrayBufferView | SharedArrayBuffer) => {
      wsRef.current?.send(data)
    },
    []
  )

  return {
    wsRef,
    isAssemblyReady,
    getWsUrl,
    connect,
    disconnect,
    send,
  }
}
