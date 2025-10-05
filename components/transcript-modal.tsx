"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TranscriptDetails } from "@/components/transcript-details"
import { useRouter } from "next/navigation"
import { FileAudio, Clock, HardDrive } from "lucide-react"
import { StatusBadge } from "@/components/status-badge"

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

type TranscriptModalProps = {
  audio: AudioFile
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  return `${minutes}m ${secs}s`
}

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  if (mb >= 1000) {
    return `${(mb / 1024).toFixed(2)} GB`
  }
  return `${mb.toFixed(2)} MB`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

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

