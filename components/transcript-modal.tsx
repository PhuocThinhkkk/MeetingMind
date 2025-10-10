"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TranscriptDetails } from "@/components/transcript-details"
import { useRouter } from "next/navigation"
import { FileAudio, Clock, HardDrive } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"
import { AudioFile } from "@/types/transcription"
import {  formatDate, formatDuration, formatFileSize} from "@/lib/utils"

type TranscriptModalProps = {
  audio: AudioFile
}


/**
 * Render a modal dialog showing details and transcript for an audio file.
 *
 * Displays the audio title, creation date, transcription status, metadata (duration, file size, MIME type),
 * and either the transcript content or a "No transcript available" fallback. Closing the dialog navigates to `/history`.
 *
 * @param audio - The audio file metadata and optional transcript to display
 * @returns A JSX element containing the transcript modal dialog
 */
export function TranscriptModal({ audio }: TranscriptModalProps) {
  const router = useRouter()

  const handleClose = () => {
    router.push("/history")
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <FileAudio className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl">{audio.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">{formatDate(audio.created_at)}</p>
              </div>
            </div>
            <StatusBadge status={audio.transcription_status} />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Audio metadata */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium">{formatDuration(audio.duration)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">File Size</p>
                <p className="text-sm font-medium">{formatFileSize(audio.file_size)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-medium font-mono">{audio.mime_type}</p>
            </div>
          </div>

          {/* Transcript details */}
          {audio.transcript ? (
            <TranscriptDetails transcript={audio.transcript} />
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <p>No transcript available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
