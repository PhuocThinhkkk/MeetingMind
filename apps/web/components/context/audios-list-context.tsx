'use client'

import React from 'react'
import { AudioFileRow } from '@/types/transcriptions/transcription.db'

type AudioContextType = {
  audios: AudioFileRow[]
  setAudios: React.Dispatch<React.SetStateAction<AudioFileRow[]>>
}

const AudioContext = React.createContext<AudioContextType | undefined>(
  undefined
)

/**
 * Provides an AudioContext containing the current `audios` array and its setter to descendant components.
 *
 * @param children - React nodes to render within the provider
 * @returns The React element that supplies the audio context to its descendants
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [audios, setAudios] = React.useState<AudioFileRow[]>([])

  return (
    <AudioContext.Provider value={{ audios, setAudios }}>
      {children}
    </AudioContext.Provider>
  )
}

/**
 * Accesses the audio context that provides the current `audios` array and its setter.
 *
 * @returns The context object containing `audios` (AudioFile[]) and `setAudios` (React state setter).
 * @throws Error when the hook is called outside of an `AudioProvider`.
 */
export function useAudio() {
  const context = React.useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
