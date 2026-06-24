'use client'

import React from 'react'
import { log } from '@/utils/logger'
import { AudioFileRow } from '@/types/transcriptions/transcription.db'
import { fetchUrlDownload } from '@/modules/transcription/client/workflow/utils'
import { validateAudioTime } from '@/modules/transcription/validations/audio-validations'

type AudioPlaybackContextType = {
  audioRef: React.RefObject<HTMLAudioElement | null>
  audioUrl: string | null
  isPlaying: boolean
  muted: boolean
  currentTime: number
  duration: number
  safeDuration: number
  currentMs: number
  togglePlay: () => void
  toggleMute: () => void
  seek: (val: number[]) => void
}

const AudioPlaybackContext = React.createContext<
  AudioPlaybackContextType | undefined
>(undefined)

type Props = {
  audioFile: AudioFileRow
  children: React.ReactNode
}

export function AudioPlaybackProvider({ audioFile, children }: Props) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [muted, setMuted] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)

  React.useEffect(() => {
    let isMounted = true

    async function fetchAudioUrl() {
      try {
        if (!audioFile?.path) {
          setAudioUrl(null)
          return
        }

        const url = await fetchUrlDownload({ path: audioFile.path })
        if (isMounted) {
          setAudioUrl(url)
        }
      } catch (error) {
        log.error('Error when fetching presigned url: ', error)
      }
    }

    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    fetchAudioUrl()

    return () => {
      isMounted = false
    }
  }, [audioFile.id, audioFile.path])

  const safeDuration = validateAudioTime(audioFile.duration)
  const currentMs = currentTime * 1000

  const togglePlay = React.useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      void audioRef.current.play()
    }
    setIsPlaying(prev => !prev)
  }, [isPlaying])

  const toggleMute = React.useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.muted = !muted
    setMuted(prev => !prev)
  }, [muted])

  const seek = React.useCallback(
    (val: number[]) => {
      if (!audioRef.current || duration === 0) return
      audioRef.current.currentTime = (val[0] / 100) * duration
    },
    [duration]
  )

  return (
    <AudioPlaybackContext.Provider
      value={{
        audioRef,
        audioUrl,
        isPlaying,
        muted,
        currentTime,
        duration,
        safeDuration,
        currentMs,
        togglePlay,
        toggleMute,
        seek,
      }}
    >
      {children}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          className="hidden"
          onLoadedMetadata={() =>
            audioRef.current && setDuration(audioRef.current.duration)
          }
          onTimeUpdate={() =>
            audioRef.current && setCurrentTime(audioRef.current.currentTime)
          }
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </AudioPlaybackContext.Provider>
  )
}

export function useAudioPlayback() {
  const context = React.useContext(AudioPlaybackContext)
  if (!context) {
    throw new Error(
      'useAudioPlayback must be used within an AudioPlaybackProvider'
    )
  }
  return context
}
