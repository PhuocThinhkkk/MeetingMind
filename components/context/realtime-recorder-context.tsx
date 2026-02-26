import { log } from '@/lib/logger'
import {
  requestMicrophoneAudio,
  requestSystemAudio,
  mixAudioStreams,
  setupAudioWorklet,
  initAudioContext,
} from '@/lib/transcript/audio-worklet-utils'
import { encodeWAV, mergeChunks } from '@/lib/transcript/transcript-realtime-utils'
import {
  useState,
  useRef,
  useCallback,
  useEffect,
  createContext,
  useContext,
} from 'react'

import {
  RealtimeTranscriptionWord,
  RealtimeTranscriptResponse,
  RealtimeTranslateResponse,
} from '@/types/transcriptions/transcription.ws'

import { resampleTo16kHz, float32ToInt16 } from '@/lib/transcript/transcript-realtime-utils'
import { useAuth } from '@/hooks/use-auth'
import { serverCheck } from '@/lib/utils/server-check'

const SAMPLE_RATE = 16000
const CHUNK_MS = 128
const CHUNK_SIZE = (SAMPLE_RATE * 2 * CHUNK_MS) / 1000

type ResponseType = 'ready' | 'transcript' | 'translate'
const READY_RESPONSE: ResponseType = 'ready'
const TRANSCRIPT_RESPONSE: ResponseType = 'transcript'
const TRANSLATE_RESPONSE: ResponseType = 'translate'

type RecorderContextType = {
  isRecording: boolean
  startRecording: () => Promise<void>
  stopRecording: () => Blob | undefined
  clearTranscript: () => void
  status: string
  transcriptWords: RealtimeTranscriptionWord[]
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
  const [status, setStatus] = useState<
    'idle' | 'connecting' | 'recording' | 'processing' | 'error'
  >('idle')
  const [transcriptWords, setTranscriptWords] = useState<
    RealtimeTranscriptionWord[]
  >([])
  const [translateWords, setTranslateWords] = useState<string[]>([])

  const wsRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isAssemblyReady = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)
  const currentAudioBufferRef = useRef<Uint8Array[]>([])
  const audioBufferRef = useRef<Uint8Array[]>([])
  const totalByteLengthRef = useRef<number>(0)
  const { session } = useAuth()

  const updateStatus = useCallback(
    (newStatus: typeof status) => {
      log.info('status change!', newStatus)
      setStatus(newStatus)
      if (newStatus === 'recording' && !sessionStartTime) {
        setSessionStartTime(new Date())
      }
    },
    [sessionStartTime]
  )

  const connectWebSocket = useCallback(() => {
    let wsDomain = process.env.NEXT_PUBLIC_WS_SERVER_URL || 'localhost:9090'

    wsDomain = wsDomain.replace(/^wss?:\/\//, '')

    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    const wsUrl = `${protocol}://${wsDomain}/ws?token=${session?.access_token}`

    try {
      wsRef.current = new WebSocket(wsUrl)

      if (!wsRef?.current) {
        log.info('no ws current yet.')
        return
      }

      handleWorkletReceivingMessages()

      wsRef.current.onopen = () => {
        log.info('WebSocket connected')
        updateStatus('recording')
      }

      wsRef.current.onerror = error => {
        log.error('WebSocket error:', error)
        updateStatus('error')
      }

      wsRef.current.onclose = e => {
        log.info(`WebSocket disconnected ${e.reason}`, e.code)
        if (status === 'recording') {
          updateStatus('idle')
        }
      }
    } catch (error) {
      log.error('Failed to connect WebSocket:', error)
      updateStatus('error')
    }
  }, [status, updateStatus])

  const startRecording = useCallback(async () => {
    clearTranscript()
    updateStatus('connecting')
    try {
      await serverCheck()
    } catch (e: any) {
      updateStatus("error")
      log.error(e)
      throw e
    }
    connectWebSocket()

    const audioContext = initAudioContext()
    audioContextRef.current = audioContext

    const micStream = await requestMicrophoneAudio()
    const systemStream = await requestSystemAudio()

    if (!systemStream && !micStream) {
      log.error('No audio streams available')
      updateStatus('error')
      throw new Error("Enable at least one audio stream to use recording.")
    }
    const mixedStream = await mixAudioStreams(
      audioContext,
      systemStream,
      micStream
    )

    streamRef.current = mixedStream

    const workletNode = await setupAudioWorklet(audioContext, mixedStream)
    handleWorkletSendingMessages(workletNode)
    workletNodeRef.current = workletNode

    setIsRecording(true)
  }, [connectWebSocket, updateStatus])

  const stopRecording = useCallback(() => {
    console.trace('🔥 stopRecording() called')
    setIsRecording(false)
    updateStatus('processing')
    log.info('stop recording')

    isAssemblyReady.current = false

    const blob = updateAudioBlobAfterRecording()
    if (audioBufferRef.current) {
      audioBufferRef.current = []
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    currentAudioBufferRef.current = []
    totalByteLengthRef.current = 0

    workletNodeRef.current = null

    setTimeout(() => {
      setTranscriptWords(prev =>
        prev.map(word => ({ ...word, word_is_final: true }))
      )
      updateStatus('idle')
    }, 1000)

    return blob
  }, [updateStatus])

  const clearTranscript = useCallback(() => {
    setTranscriptWords([])
  }, [])

  /**
   * Forwards audio frames from an AudioWorkletNode to the WebSocket as merged 16-bit PCM chunks when enough data accumulates.
   *
   * Listens on the worklet node's message port, resamples and converts incoming audio frames to 16-bit PCM, accumulates bytes in an internal buffer, and sends a merged binary payload over the open WebSocket once the accumulated byte count reaches the configured send threshold.
   *
   * @param workletNode - The AudioWorkletNode whose port emits audio frames to forward
   */
  function handleWorkletSendingMessages(workletNode: AudioWorkletNode) {
    workletNode.port.onmessage = async event => {
      if (
        event.data &&
        wsRef.current?.readyState === WebSocket.OPEN &&
        isAssemblyReady.current
      ) {
        const resampled = await resampleTo16kHz(event.data)
        const pcmData = float32ToInt16(resampled)

        const chunk = new Uint8Array(pcmData.buffer)
        currentAudioBufferRef.current.push(chunk)
        audioBufferRef.current.push(chunk)
        totalByteLengthRef.current += chunk.byteLength

        if (totalByteLengthRef.current >= 1800) {
          const merged = new Uint8Array(totalByteLengthRef.current)
          let offset = 0
          for (const part of currentAudioBufferRef.current) {
            if (offset + part.length <= merged.length) {
              merged.set(part, offset)
              offset += part.length
            } else {
              log.warn('Audio chunk too large, skipping overflow data')
            }
          }

          if (!wsRef.current) {
            log.info('ws has been closed already')
            return
          }

          wsRef.current.send(merged.buffer)
          log.info('Sent audio chunk of size:', merged.byteLength)
          currentAudioBufferRef.current = []
          totalByteLengthRef.current = 0
        }
      }
    }
  }

  /**
   * Installs a WebSocket onmessage handler to process realtime recorder responses.
   *
   * Processes READY, TRANSCRIPT, and TRANSLATE responses: marks the assembly ready, updates `transcriptWords`
   * (preserving previously finalized words), and appends translations. Logs unknown response types and JSON parse errors.
   *
   * Side effects: updates `isAssemblyReady.current`, `transcriptWords`, and `translateWords`. Requires `wsRef.current` to be defined.
   */
  function handleWorkletReceivingMessages() {
    if (!wsRef.current) {
      log.info('ws has been closed already')
      return
    }

    wsRef.current.onmessage = event => {
      try {
        const res = JSON.parse(event.data)
        if (res.type === READY_RESPONSE) {
          log.info('Assembly is ready!')
          isAssemblyReady.current = true
        } else if (res.type === TRANSCRIPT_RESPONSE) {
          const data: RealtimeTranscriptResponse = res
          if (data.words.length === 0) {
            log.warn('No words in transcription response')
            return
          }
          const newWords: RealtimeTranscriptionWord[] = data.words.map(
            (word, index) => ({
              text: word.text,
              word_is_final: word.word_is_final,
              start: word.start,
              end: word.end,
              confidence: word.confidence,
            })
          )

          // TODO: handle end of turn later
          setTranscriptWords(prev => {
            const stableCount = prev.filter(w => w.word_is_final).length
            const updatedWords = [...prev.slice(0, stableCount), ...newWords]
            return updatedWords
          })
        } else if (res.type === TRANSLATE_RESPONSE) {
          log.info('Received translation response:', res)
          const data: RealtimeTranslateResponse = res
          if (data.words === '') {
            log.warn('No words in translation response')
            return
          }
          const newWord = data.words
          setTranslateWords(prev => [...prev, newWord])
        } else {
          log.error('Unknown response :', res)
        }
      } catch (error) {
        log.error('Error parsing WebSocket message:', error)
      }
    }
  }

  /**
   * Create a WAV file from the accumulated audio buffer, if any audio data exists.
   *
   * @returns A `Blob` containing the encoded WAV audio when audio data is present, `undefined` if no audio data is available.
   */
  function updateAudioBlobAfterRecording() {
    if (!audioBufferRef.current) {
      log.warn('No audio buffer to process')
      return
    }

    if (audioBufferRef.current.length === 0) {
      log.warn('Audio buffer is empty, skipping blob creation')
      return
    }

    if (audioBufferRef.current.length !== 0) {
      const merged = mergeChunks(audioBufferRef.current)
      const pcm = new Int16Array(merged.buffer)
      const wavBlob = encodeWAV(pcm, SAMPLE_RATE)
      log.info('Created WAV blob of size:', wavBlob.size)
      return wavBlob
    }
  }

  useEffect(() => {
    return () => {
      log.info('Cleaning up recorder on unmount')
      if (isRecording) {
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
        clearTranscript,
        transcriptWords,
        translateWords,
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