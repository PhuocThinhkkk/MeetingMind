"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { TranscriptDetails } from "@/components/transcript-details"
import { FileAudio, Clock, HardDrive } from "lucide-react"
import { AudioFile } from "@/types/transcription"
import { formatDate, formatDuration, formatFileSize} from "@/lib/utils"


type AudioCardProps = {
  audio: AudioFile
  isExpanded: boolean
  onToggle: () => void
}


/**
 * Renders an accessible, clickable card for an audio file showing metadata, transcription status, and optional transcript details.
 *
 * Displays the audio name and creation date, duration, file size, MIME type, and a status badge; shows a processing or failed indicator when applicable.
 *
 * @param audio - The audio file data used to populate metadata, status, and transcript content.
 * @param isExpanded - Whether the transcript details panel is expanded.
 * @param onToggle - Callback invoked to toggle the expanded state (also triggered by Enter/Space).
 * @returns A Card element representing the audio entry with a left metadata panel and a right transcript/details panel.
 */
export function AudioCard({ audio, isExpanded, onToggle }: AudioCardProps) {
  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md cursor-pointer" 
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
    >      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] min-h-[200px]">
        {/* Left side - Audio info (compact) */}
        <div className="border-r">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <FileAudio className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-foreground truncate">{audio.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(audio.created_at)}</p>
                </div>
              </div>
              <StatusBadge status={audio.transcription_status} />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">Duration:</span>
                <span className="font-medium text-foreground text-xs">{formatDuration(audio.duration)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground text-xs">Size:</span>
                <span className="font-medium text-foreground text-xs">{formatFileSize(audio.file_size)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground text-xs">Type:</span>
                <span className="font-medium text-foreground font-mono text-xs">{audio.mime_type}</span>
              </div>
            </div>

            {audio.transcription_status === "processing" && (
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Transcribing...</span>
                </div>
              </div>
            )}

            {audio.transcription_status === "failed" && (
              <div className="border-t pt-3 mt-3">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                  <p className="text-xs text-destructive">Transcription failed.</p>
                </div>
              </div>
            )}
          </CardContent>
        </div>

        {/* Right side - Transcript details */}
        <div className="bg-muted/20">
          {audio.transcript && isExpanded ? (
            <div className="p-6">
              <TranscriptDetails transcript={audio.transcript} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <p className="text-sm text-muted-foreground text-center">
                {audio.transcript ? "Click to view transcript details" : "No transcript available"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
