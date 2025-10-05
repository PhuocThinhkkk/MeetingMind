"use client";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { FileAudio } from "lucide-react";
import { useRouter } from "next/navigation";
import TimeDisplay from "@/components/time-display";
import { AudioFile } from "@/types/transcription";
import {  formatDuration, formatFileSize} from "@/lib/utils"

type CompactAudioCardProps = {
  audio: AudioFile;
};

export function CompactAudioCard({ audio }: CompactAudioCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (audio.transcript) {
      router.push(`?id=${audio.id}`);
    }
  };

  return (
    <Card
      className="p-3 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
          <FileAudio className="w-4 h-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground truncate">
            {audio.name}
          </h3>
        </div>

        <StatusBadge status={audio.transcription_status} />

        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
          <TimeDisplay dateString={audio.created_at} />
          <span>{formatDuration(audio.duration)}</span>
          <span>{formatFileSize(audio.file_size)}</span>
        </div>
      </div>
    </Card>
  );
}

