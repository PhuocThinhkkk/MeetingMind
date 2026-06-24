'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import {
  Clock,
  User,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileAudio,
} from 'lucide-react'

import { useTranscriptionView } from '@/components/context/transcription-view-context'
import { TranscriptSentences } from './transcript-sentences'
import { log } from '@/utils/logger'
import { useAudioPlayback } from '@/components/context/audio-playback-context'

export function TranscriptTab() {
  const { audio: audioFile, transcript } = useTranscriptionView()
  const {
    isPlaying,
    muted,
    currentTime,
    duration,
    safeDuration,
    currentMs,
    togglePlay,
    toggleMute,
    seek,
  } = useAudioPlayback()

  if (!transcript) {
    return <p className="text-muted-foreground">No transcript available.</p>
  }

  /**
   * Format a time given in seconds as "M:SS".
   *
   * @param sec - Time in seconds.
   * @returns The formatted time string with minutes (no leading zeros) and seconds padded to two digits, e.g. "2:05".
   */
  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }
  log.info('transcription: ', transcript)

  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileAudio className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">{audioFile.name}</CardTitle>
        </div>

        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(safeDuration)}
          </span>

          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {transcript.speakers_detected ?? 1} speakers
          </span>
        </div>

        {/* Player */}
        <div className="flex items-center gap-4 rounded-lg bg-muted/30 p-3">
          <button
            onClick={togglePlay}
            className="rounded-full bg-primary p-2 text-white"
          >
            {isPlaying ? <Pause /> : <Play />}
          </button>

          <span className="w-10 text-xs text-right">
            {formatTime(currentTime)}
          </span>

          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            max={100}
            step={0.1}
            onValueChange={seek}
            className="flex-1"
          />

          <span className="w-10 text-xs">{formatTime(duration)}</span>

          <button onClick={toggleMute}>
            {muted ? <VolumeX /> : <Volume2 />}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[40vh] text-sm">
          <TranscriptSentences
            words={transcript.transcription_words}
            currentMs={currentMs}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
