import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from 'react'

import { serverCheck } from '@/lib/server-check'
import {
  float32ToInt16,
  resampleTo16kHz,
} from '@/lib/transcript/transcript-realtime-utils'
import {
  RealtimeTranscriptResponse,
  RealtimeTranscriptionWord,
  RealtimeTranslateResponse,
} from '@/types/transcriptions/transcription.ws'
import { log } from '@/utils/logger'

import { useAudioBuffer } from './audio-buffer'
import { AudioSessionStartConfig, useAudioSession } from './audio-session'
import { useRecorderWebSocket } from './websocket'
import {
  handleTranscriptResponse,
  handleTranslateResponse,
} from './response-handler'

export type RecorderStartConfig = AudioSessionStartConfig & {
  targetLanguage: string
}

type RecorderContextType = {
  isRecording: boolean
  startRecording: (config: RecorderStartConfig) => Promise<void>
  stopRecording: () => Blob | undefined
  clearTranscript: () => void
  status: string
  errorMessage: string | null
  transcriptTurns: RealtimeTranscriptResponse[]
  transcriptWords: RealtimeTranscriptionWord[]
  translateTurns: RealtimeTranslateResponse[]
  translateWords: string[]
  sessionStartTime: Date | null
  setSessionStartTime: React.Dispatch<React.SetStateAction<Date | null>>
}

const RecorderContext = createContext<RecorderContextType | undefined>(
  undefined
)

export const RecorderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<
    'idle' | 'connecting' | 'recording' | 'processing' | 'error'
  >('idle')
  const [transcriptTurns, setTranscriptTurns] = useState<
    RealtimeTranscriptResponse[]
  >([])
  const [translateTurns, setTranslateTurns] = useState<
    RealtimeTranslateResponse[]
  >([])

  const transcriptWords = useMemo(
    () => transcriptTurns.flatMap(turn => turn.words),
    [transcriptTurns]
  )
  const translateWords = useMemo(
    () => translateTurns.map(turn => turn.translated_text),
    [translateTurns]
  )

  const statusRef = useRef(status)
  const audioBuffer = useAudioBuffer()
  const audioSession = useAudioSession()

  const updateStatus = useCallback(
    (newStatus: typeof status) => {
      log.info('status change!', newStatus)
      statusRef.current = newStatus
      setStatus(newStatus)
      if (newStatus === 'recording' && !sessionStartTime) {
        setSessionStartTime(new Date())
      }
    },
    [sessionStartTime]
  )

  const websocket = useRecorderWebSocket({
    onOpen: () => {
      log.info('WebSocket connected and ready for audio streaming')
    },
    onError: () => {
      setErrorMessage(
        'The transcription connection encountered an error. Please try again.'
      )
      updateStatus('error')
    },
    onClose: event => {
      log.info(`WebSocket disconnected ${event.reason}`, event.code)
      if (statusRef.current === 'recording') {
        updateStatus('idle')
      }
    },
    onTranscript: response =>
      handleTranscriptResponse(response, setTranscriptTurns),

    onTranslate: response =>
      handleTranslateResponse(response, setTranslateTurns),
  })

  const clearTranscript = useCallback(() => {
    setTranscriptTurns([])
    setTranslateTurns([])
  }, [])

  const clearRuntimeError = useCallback(() => {
    setErrorMessage(null)
  }, [])

  const handleWorkletSendingMessages = useCallback(
    (workletNode: AudioWorkletNode) => {
      workletNode.port.onmessage = async event => {
        if (
          event.data &&
          websocket.wsRef.current?.readyState === WebSocket.OPEN &&
          websocket.isAssemblyReady.current
        ) {
          const resampled = await resampleTo16kHz(event.data)
          const pcmData = float32ToInt16(resampled)

          const chunk = new Uint8Array(pcmData.buffer)
          const buffered = audioBuffer.addChunk(chunk)

          if (buffered.shouldFlush && buffered.payload) {
            if (!websocket.wsRef.current) {
              log.info('ws has been closed already')
              return
            }

            websocket.send(buffered.payload)
            log.info('Sent audio chunk of size:', buffered.payload.byteLength)
          }
        }
      }
    },
    [audioBuffer, websocket]
  )

  const startRecording = useCallback(
    async (config: RecorderStartConfig) => {
      clearRuntimeError()

      if (!config.microphoneStream && !config.systemAudioStream) {
        const error = new Error(
          'Enable at least one audio source to start recording.'
        )
        setErrorMessage(error.message)
        updateStatus('error')
        throw error
      }

      if (!config.targetLanguage) {
        const error = new Error(
          'Choose a translation target language before recording.'
        )
        setErrorMessage(error.message)
        updateStatus('error')
        throw error
      }

      clearTranscript()
      updateStatus('connecting')

      let url: string
      try {
        await serverCheck()
        url = websocket.getWsUrl(config.targetLanguage)
        await websocket.connect(url)
      } catch (error: any) {
        updateStatus('error')
        setErrorMessage(
          error?.message ?? 'Unable to connect to the transcription service.'
        )
        log.error(error)
        websocket.disconnect()
        throw error
      }

      try {
        const { workletNode } = await audioSession.start({
          microphoneStream: config.microphoneStream,
          systemAudioStream: config.systemAudioStream,
        })
        handleWorkletSendingMessages(workletNode)

        setIsRecording(true)
        updateStatus('recording')
      } catch (error: any) {
        updateStatus('error')
        setErrorMessage(
          error?.message ??
            'Unable to start audio capture. Please check your browser permissions.'
        )
        log.error(error)
        audioSession.stop()
        websocket.disconnect()
        throw error
      }
    },
    [
      audioSession,
      clearRuntimeError,
      clearTranscript,
      handleWorkletSendingMessages,
      updateStatus,
      websocket,
    ]
  )

  const stopRecording = useCallback(() => {
    console.trace('🔥 stopRecording() called')
    setIsRecording(false)
    updateStatus('processing')
    clearRuntimeError()
    log.info('stop recording')

    const blob = audioBuffer.createBlob()

    audioSession.stop()
    audioBuffer.clear()
    websocket.disconnect()

    setTimeout(() => {
      setTranscriptTurns(prev =>
        prev.map(turn => ({
          ...turn,
          is_end_of_turn: true,
          isEndOfTurn: true,
          words: turn.words.map(word => ({ ...word, word_is_final: true })),
        }))
      )
      updateStatus('idle')
    }, 1000)

    return blob
  }, [audioBuffer, audioSession, clearRuntimeError, updateStatus, websocket])

  const isRecordingRef = useRef(isRecording)
  useEffect(() => {
    isRecordingRef.current = isRecording
  }, [isRecording])

  useEffect(() => {
    return () => {
      log.info('Cleaning up recorder on unmount')
      if (isRecordingRef.current) {
        log.info('stopping recording due to unmount')
        stopRecording()
      }
    }
  }, [])

  return (
    <RecorderContext.Provider
      value={{
        isRecording,
        startRecording,
        stopRecording,
        status,
        errorMessage,
        clearTranscript,
        transcriptTurns,
        transcriptWords,
        translateWords,
        translateTurns,
        sessionStartTime,
        setSessionStartTime,
      }}
    >
      {children}
    </RecorderContext.Provider>
  )
}

export const useRecorder = (): RecorderContextType => {
  const context = useContext(RecorderContext)
  if (!context) {
    throw new Error('useRecorder must be used within a RecorderProvider')
  }
  return context
}
