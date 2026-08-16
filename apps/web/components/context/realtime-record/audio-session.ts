import { useCallback, useRef } from 'react'

import {
  requestMicrophoneAudio,
  requestSystemAudio,
  mixAudioStreams,
  setupAudioWorklet,
  initAudioContext,
} from '@/lib/transcript/audio-worklet-utils'
import { log } from '@/utils/logger'

export type AudioSessionStartConfig = {
  microphoneStream?: MediaStream | null
  systemAudioStream?: MediaStream | null
}

/**
 * Provides controls for starting and stopping an audio recording session.
 *
 * @returns Functions that initialize the audio session and release its resources
 */
export function useAudioSession() {
  const streamRef = useRef<MediaStream | null>(null)
  const inputStreamsRef = useRef<MediaStream[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)

  const stop = useCallback(() => {
    if (inputStreamsRef.current.length > 0) {
      inputStreamsRef.current.forEach(stream => {
        stream.getTracks().forEach(track => track.stop())
      })
      inputStreamsRef.current = []
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    workletNodeRef.current = null
  }, [])

  const start = useCallback(
    async (config: AudioSessionStartConfig) => {
      const audioContext = initAudioContext()
      audioContextRef.current = audioContext

      const acquiredStreams: MediaStream[] = []

      try {
        const micStream = config.microphoneStream ?? null
        const systemStream = config.systemAudioStream ?? null

        if (micStream) {
          acquiredStreams.push(micStream)
        }

        if (systemStream) {
          acquiredStreams.push(systemStream)
        }

        if (!micStream && !systemStream) {
          throw new Error('Enable at least one audio source to use recording.')
        }

        const mixedStream = await mixAudioStreams(
          audioContext,
          systemStream,
          micStream
        )

        streamRef.current = mixedStream
        inputStreamsRef.current = acquiredStreams

        const workletNode = await setupAudioWorklet(audioContext, mixedStream)

        workletNodeRef.current = workletNode

        return {
          audioContext,
          mixedStream,
          workletNode,
        }
      } catch (error) {
        acquiredStreams.forEach(stream => {
          stream.getTracks().forEach(track => track.stop())
        })

        stop()
        throw error
      }
    },
    [stop]
  )

  return {
    start,
    stop,
  }
}
