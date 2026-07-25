import { useCallback, useRef } from 'react'

import {
  requestMicrophoneAudio,
  requestSystemAudio,
  mixAudioStreams,
  setupAudioWorklet,
  initAudioContext,
} from '@/lib/transcript/audio-worklet-utils'
import { log } from '@/utils/logger'

export function useAudioSession() {
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const workletNodeRef = useRef<AudioWorkletNode | null>(null)

  const start = useCallback(async () => {
    const audioContext = initAudioContext()
    audioContextRef.current = audioContext

    const micStream = await requestMicrophoneAudio()
    const systemStream = await requestSystemAudio()

    if (!systemStream && !micStream) {
      log.error('No audio streams available')
      throw new Error('Enable at least one audio stream to use recording.')
    }

    const mixedStream = await mixAudioStreams(
      audioContext,
      systemStream,
      micStream
    )

    streamRef.current = mixedStream

    const workletNode = await setupAudioWorklet(audioContext, mixedStream)
    workletNodeRef.current = workletNode

    return {
      audioContext,
      mixedStream,
      workletNode,
    }
  }, [])

  const stop = useCallback(() => {
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

  return {
    start,
    stop,
  }
}
