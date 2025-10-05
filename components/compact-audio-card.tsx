"use client";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { FileAudio } from "lucide-react";
import { useRouter } from "next/navigation";
import TimeDisplay from "@/components/time-display";

type Transcript = {
  id: string;
  audio_id: string;
  text: string;
  language: string;
  confidence_score: number;
  speakers_detected: number;
  created_at: string;
};

type AudioFile = {
  id: string;
  user_id: string;
  name: string;
  url: string;
  duration: number;
  file_size: number;
  mime_type: string;
  transcription_status: string;
  created_at: string;
  updated_at: string;
  transcript: Transcript | null;
};

type CompactAudioCardProps = {
  audio: AudioFile;
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1000) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(2)} MB`;
}

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

