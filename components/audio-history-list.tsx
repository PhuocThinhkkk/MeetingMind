"use client";

import { CompactAudioCard } from "@/components/compact-audio-card";
import { AudioFile } from "@/types/transcription";

type AudioHistoryListProps = {
  audioHistory: AudioFile[];
};

export function AudioHistoryList({ audioHistory }: AudioHistoryListProps) {
  const groupedAudio = groupByDay(audioHistory);

  return (
    <div className="space-y-6">
      {Object.entries(groupedAudio).map(([day, audios]) => (
        <div key={day}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            {day}
          </h2>
          <div className="space-y-2">
            {audios.map((audio) => (
              <CompactAudioCard key={audio.id} audio={audio} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByDay(audioFiles: AudioFile[]) {
  const groups: { [key: string]: AudioFile[] } = {};

  audioFiles.forEach((audio) => {
    if (!audio.created_at) {

        const label = "Unknown Date";
        if (!groups[label]) {
          groups[label] = [];
        }
        groups[label].push(audio);
        return;

    }
    const date = new Date(audio.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label: string;

    if (date.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(audio);
  });

  return groups;
}
