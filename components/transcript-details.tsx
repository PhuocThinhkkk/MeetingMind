import { Badge } from "@/components/ui/badge"
import { Users, Languages, Target, Calendar } from "lucide-react"

type Transcript = {
  id: string
  audio_id: string
  text: string
  language: string
  confidence_score: number
  speakers_detected: number
  created_at: string
}

type TranscriptDetailsProps = {
  transcript: Transcript
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

export function TranscriptDetails({ transcript }: TranscriptDetailsProps) {
  const confidencePercentage = (transcript.confidence_score * 100).toFixed(1)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Language</p>
            <p className="text-sm font-medium text-foreground">{transcript.language}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Confidence</p>
            <p className="text-sm font-medium text-foreground">{confidencePercentage}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Speakers</p>
            <p className="text-sm font-medium text-foreground">{transcript.speakers_detected}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Transcribed</p>
            <p className="text-sm font-medium text-foreground">{formatDate(transcript.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="bg-background rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">Transcript Text</h4>
          <Badge variant="secondary" className="text-xs">
            ID: {transcript.id.slice(0, 8)}...
          </Badge>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{transcript.text}</p>
      </div>
    </div>
  )
}

