import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Transcript } from "@/types/transcription";
import { formatDate } from "@/lib/utils";

type TranscriptDetailsProps = {
  transcript: Transcript;
};

export function TranscriptDetails({ transcript }: TranscriptDetailsProps) {
  let currentTranscriptId;
  if (transcript.id) {
    currentTranscriptId = transcript.id.slice(0, 8) + "...";
  } else {
    currentTranscriptId = "N/A";
    console.error("Transcript ID is undefined", transcript);
  }

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
          {transcript.text}
        </p>
      </div>
    </div>
  );
}
