import { log } from '@/lib/logger'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { Transcript } from '@/types/transcription.db'
import { formatDate } from '@/lib/utils'

type TranscriptDetailsProps = {
  transcript: Transcript
  currentTimeSeconds: number
}

/**
 * Render transcript metadata and the transcript text with a truncated ID badge and active-word highlighting.
 *
 * Displays the transcribed date, a header with a truncated transcript ID (first 8 characters followed by "..." or `"N/A"` when absent), and the transcript text. If `transcript.id` is undefined, an error is logged via `log.error`. When `transcript.words` is present, words near `currentTimeSeconds` are visually highlighted.
 *
 * @param transcript - Transcript object (expected to include `id`, `created_at`, and either `text` or `words`)
 * @param currentTimeSeconds - Current playback time in seconds used to determine which words are highlighted
 * @returns A React element containing the transcript's date, ID badge, and text content (with optional per-word highlighting)
 */
export function TranscriptDetails({
  transcript,
  currentTimeSeconds,
}: TranscriptDetailsProps) {
  const currentMs = currentTimeSeconds * 1000
  let currentTranscriptId = transcript.id
    ? transcript.id.slice(0, 8) + '...'
    : 'N/A'

  if (!transcript.id) {
    log.error('Transcript ID is undefined', transcript)
  }

  const windowBefore = 300
  const windowAfter = 300

  const activeWords =
    transcript.words?.filter(
      word =>
        currentMs >= word.start_time - windowBefore &&
        currentMs <= word.end_time + windowAfter
    ) || []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="text-xs text-muted-foreground">Transcribed</p>
          <p className="text-sm font-medium text-foreground">
            {formatDate(transcript.created_at)}
          </p>
        </div>
      </div>

      <div className="bg-background rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">
            Transcript Text
          </h4>
          <Badge variant="secondary" className="text-xs">
            ID: {currentTranscriptId}
          </Badge>
        </div>

        <p className="text-sm text-foreground leading-relaxed">
          {transcript.words ? (
            transcript.words.map(word => {
              const isActive = activeWords.includes(word)
              return (
                <span
                  key={word.id}
                  className={
                    isActive ? 'text-blue-500 bg-blue-100 font-bold' : ''
                  }
                >
                  {word.text + ' '}
                </span>
              )
            })
          ) : (
            <span>{transcript.text}</span>
          )}
        </p>
      </div>
    </div>
  )
}
