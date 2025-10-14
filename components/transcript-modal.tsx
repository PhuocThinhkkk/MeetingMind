"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TranscriptDetails } from "@/components/transcript-details";
import { useRouter } from "next/navigation";
import { FileAudio, Clock, HardDrive } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { AudioFile } from "@/types/transcription";
import { formatDate, formatDuration, formatFileSize } from "@/lib/utils";
import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

type TranscriptModalProps = {
  audio: AudioFile;
};

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const router = useRouter();

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }
  function toggleMute() {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(!muted);
  }

  function handleClose() {
    router.push("/history");
  }

  function handleLoadedMetadata() {
    if (audioRef.current) {
      setDurationSeconds(audioRef.current.duration);
    }
  }

  function handleTimeUpdate() {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTimeSeconds(current);
      setProgressPercent((current / dur) * 100);
    }
  }

  function handleSeek(val: number[]) {
    if (!audioRef.current || durationSeconds === 0) return;

    const newTime = (val[0] / 100) * durationSeconds;
    audioRef.current.currentTime = newTime;
    setProgressPercent(val[0]);
  }

  function handleEnded() {
    setIsPlaying(false);
  }

  function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(audio.created_at)}
                </p>
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
                <p className="text-sm font-medium">
                  {formatDuration(audio.duration)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">File Size</p>
                <p className="text-sm font-medium">
                  {formatFileSize(audio.file_size)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-medium font-mono">{audio.mime_type}</p>
            </div>
          </div>

          {/* Audio player */}
          <div className="p-4 bg-muted/30 rounded-lg flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            <div className="flex flex-1 items-center gap-2">
              <span className="text-xs text-muted-foreground w-10 text-right">
                {formatTime(currentTimeSeconds)}
              </span>
              <Slider
                value={[progressPercent]}
                max={100}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(durationSeconds)}
              </span>
            </div>

            {/* Volume */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-full bg-muted hover:bg-muted/50 transition shrink-0"
            >
              {muted ? (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            <audio
              ref={audioRef}
              src={audio.url}
              className="hidden"
              onEnded={handleEnded}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
            />
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
  );
}
