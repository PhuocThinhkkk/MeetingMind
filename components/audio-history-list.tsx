'use client'

import { CompactAudioCard } from '@/components/compact-audio-card'
import { AudioFile } from '@/types/transcription.db'

type AudioHistoryListProps = {
  audioHistory: AudioFile[]
}

/**
 * Renders a vertical list of audio history grouped by day.
 *
 * Groups items into labeled day buckets ("Today", "Yesterday", a short date, or "Unknown Date"), sorts those day groups by date descending, and renders each group's audios as CompactAudioCard entries.
 *
 * @param audioHistory - Array of AudioFile objects to display in the history list.
 * @returns The JSX element containing the grouped and sorted audio history.
 */
export function AudioHistoryList({ audioHistory }: AudioHistoryListProps) {
  const groupedAudio = groupByDay(audioHistory)

  return (
    <div className="space-y-6">
      {Object.entries(groupedAudio)
        .sort(([, a], [, b]) => {
          const aDate = a[0]?.created_at
            ? new Date(a[0].created_at)
            : new Date(0)
          const bDate = b[0]?.created_at
            ? new Date(b[0].created_at)
            : new Date(0)
          return bDate.getTime() - aDate.getTime()
        })
        .map(([day, audios]) => (
          <div key={day}>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              {day}
            </h2>
            <div className="space-y-2">
              {audios.map(audio => (
                <CompactAudioCard key={audio.id} audio={audio} />
              ))}
            </div>
          </div>
        ))}{' '}
    </div>
  )
}

/**
 * Group audio files into labeled day buckets (e.g., "Today", "Yesterday", a locale-formatted date, or "Unknown Date").
 *
 * @param audioFiles - Array of AudioFile objects to group; items with missing or invalid `created_at` are assigned to the "Unknown Date" bucket.
 * @returns An object mapping day label strings to arrays of AudioFile objects for that label. Dates are formatted using the "en-US" locale with a short month and numeric day; the year is included only when it differs from the current year.
 */
function groupByDay(audioFiles: AudioFile[]) {
  const groups: { [key: string]: AudioFile[] } = {}

  audioFiles.forEach(audio => {
    if (!audio.created_at) {
      const label = 'Unknown Date'
      if (!groups[label]) {
        groups[label] = []
      }
      groups[label].push(audio)
      return
    }
    const date = new Date(audio.created_at)
    if (isNaN(date.getTime())) {
      const label = 'Unknown Date'
      if (!groups[label]) {
        groups[label] = []
      }
      groups[label].push(audio)
      return
    }
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let label: string

    if (date.toDateString() === today.toDateString()) {
      label = 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday'
    } else {
      label = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year:
          date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      })
    }

    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(audio)
  })

  return groups
}
