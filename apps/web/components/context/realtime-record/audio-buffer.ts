import { useCallback, useRef } from 'react'

import { log } from '@/utils/logger'
import {
  encodeWAV,
  mergeChunks,
} from '@/lib/transcript/transcript-realtime-utils'

const SAMPLE_RATE = 16000
const SEND_THRESHOLD_BYTES = 1800

type AddChunkResult = {
  shouldFlush: boolean
  payload?: ArrayBuffer
}

export function useAudioBuffer() {
  const currentAudioBufferRef = useRef<Uint8Array[]>([])
  const audioBufferRef = useRef<Uint8Array[]>([])
  const totalByteLengthRef = useRef<number>(0)

  const addChunk = useCallback((chunk: Uint8Array): AddChunkResult => {
    currentAudioBufferRef.current.push(chunk)
    audioBufferRef.current.push(chunk)
    totalByteLengthRef.current += chunk.byteLength

    if (totalByteLengthRef.current < SEND_THRESHOLD_BYTES) {
      return { shouldFlush: false }
    }

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

    currentAudioBufferRef.current = []
    totalByteLengthRef.current = 0

    return {
      shouldFlush: true,
      payload: merged.buffer,
    }
  }, [])

  const clear = useCallback(() => {
    currentAudioBufferRef.current = []
    audioBufferRef.current = []
    totalByteLengthRef.current = 0
  }, [])

  const createBlob = useCallback(() => {
    if (!audioBufferRef.current) {
      log.warn('No audio buffer to process')
      return
    }

    if (audioBufferRef.current.length === 0) {
      log.warn('Audio buffer is empty, skipping blob creation')
      return
    }

    const merged = mergeChunks(audioBufferRef.current)
    const pcm = new Int16Array(merged.buffer)
    const wavBlob = encodeWAV(pcm, SAMPLE_RATE)
    log.info('Created WAV blob of size:', wavBlob.size)
    return wavBlob
  }, [])

  return {
    addChunk,
    clear,
    createBlob,
  }
}
