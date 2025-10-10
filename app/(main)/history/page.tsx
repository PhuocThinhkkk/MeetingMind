"use client";
import { AudioHistoryList } from "@/components/audio-history-list";
import { useAuth } from "@/hooks/use-auth";
import { HistoryToolbar } from "@/components/history-toolbar";
import { TranscriptModal } from "@/components/transcript-modal";
import { getAudioHistory } from "@/lib/query/audio";
import { AudioFile } from "@/types/transcription";
import React from "react";
import { useSearchParams } from "next/navigation";


export default function TranscriptHistoryPage() {
  const [audios, setAudios] = React.useState<AudioFile[]>([]);
  const { user } = useAuth();

  React.useEffect(() => {
      async function initializeAudiosFetch() {
          if (!user) {
              setAudios([]);
              return;
          }
          const audios = await getAudioHistory(user.id);
          if (audios.length === 0) {
              setAudios([]);
              return;
          }
          console.log("Fetched audio history for user", user.id, audios);
          setAudios(audios);
      }

      initializeAudiosFetch();
  }, [user]);

  const searchParams = useSearchParams();
  const audioId = searchParams.get("audioId");
  const selectedAudio = audioId
    ? audios.find((audio) => audio.id === audioId)
    : null;

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">        <div className="mb-6 border-b pb-3">
          <h1 className="text-xl font-semibold text-foreground">
            History Recording
          </h1>
        </div>

        <HistoryToolbar />

        <AudioHistoryList audioHistory={audios} />

        {selectedAudio && <TranscriptModal audio={selectedAudio} />}
      </div>
    </main>
  );
}
