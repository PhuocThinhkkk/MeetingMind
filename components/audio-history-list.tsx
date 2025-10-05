"use client"

import { CompactAudioCard } from "@/components/compact-audio-card"

type Transcript = {
  id: string
  audio_id: string
  text: string
  language: string
  confidence_score: number
  speakers_detected: number
  created_at: string
}

type AudioFile = {
  id: string
  user_id: string
  name: string
  url: string
  duration: number
  file_size: number
  mime_type: string
  transcription_status: string
  created_at: string
  updated_at: string
  transcript: Transcript | null
}

type AudioHistoryListProps = {
  audioHistory: AudioFile[]
}

function groupByDay(audioFiles: AudioFile[]) {
  const groups: { [key: string]: AudioFile[] } = {}

  audioFiles.forEach((audio) => {
    const date = new Date(audio.created_at)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let label: string

    if (date.toDateString() === today.toDateString()) {
      label = "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = "Yesterday"
    } else {
      label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      })
    }

    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(audio)
  })

  return groups
}

export function AudioHistoryList({ audioHistory }: AudioHistoryListProps) {
  const groupedAudio = groupByDay(audioHistory)

  return (
    <div className="space-y-6">
      {Object.entries(groupedAudio).map(([day, audios]) => (
        <div key={day}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">{day}</h2>
          <div className="space-y-2">
            {audios.map((audio) => (
              <CompactAudioCard key={audio.id} audio={audio} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

