"use client";
import { AudioHistoryList } from "@/components/audio-history-list";
import { log } from "@/lib/logger";
import { useAuth } from "@/hooks/use-auth";
import { HistoryToolbar } from "@/components/history-toolbar";
import { TranscriptModal } from "@/components/transcript-modal";
import { getAudioHistory } from "@/lib/query/audio-operations";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useAudio } from "@/components/context/audios-list-context";

/**
 * Renders the transcript history page showing the current user's audio recordings and opens a transcript modal when an audio is selected via the URL.
 *
 * The component fetches the authenticated user's audio history and updates the audio context; if no user is present or the fetch returns an empty list, the audio list is cleared.
 *
 * @returns The page JSX containing the history toolbar, filtered audio history list, and an optional TranscriptModal for the selected audio.
 */
export default function TranscriptHistoryPage() {
  const { audios, setAudios } = useAudio();
  const { user } = useAuth();

  React.useEffect(() => {
    let cancelled = false;
    /**
     * Initialize and populate the audios state with the authenticated user's audio history.
     *
     * If there is no authenticated user or the fetched history is empty, clears the audios state.
     * If the fetch completes after the operation is cancelled, no state is modified.
     * On successful fetch with results, logs the retrieval and updates the audios state with the fetched list.
     */
    async function initializeAudiosFetch() {
      if (!user) {
        setAudios([]);
        return;
      }
      const audios = await getAudioHistory(user.id);
      if (cancelled) {
        return;
      }
      if (audios.length === 0) {
        setAudios([]);
        return;
      }
      log.info(`Fetched audio history for user ${user.id}`, audios);
      setAudios(audios);
    }

    initializeAudiosFetch();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("All");

  const filteredAudios = React.useMemo(() => {
    let filtered = [...audios];

    if (searchQuery.trim()) {
      filtered = filtered.filter((audio) =>
        audio.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedStatus !== "All") {
      const statusMap: Record<string, string> = {
        Done: "done",
        Processing: "processing",
        Error: "error",
        Unknown: "unknown",
      };
      const mappedStatus =
        statusMap[selectedStatus] || selectedStatus.toLowerCase();
      filtered = filtered.filter(
        (audio) => audio.transcription_status.toLowerCase() === mappedStatus,
      );
    }

    return filtered;
  }, [audios, searchQuery, selectedStatus]);

  const searchParams = useSearchParams();
  const audioId = searchParams.get("audioId");
  const selectedAudio = audioId
    ? audios.find((audio) => audio.id === audioId)
    : null;

  return (
    <>
      <HistoryToolbar
        setSearchQuery={setSearchQuery}
        setSelectedStatus={setSelectedStatus}
        searchQuery={searchQuery}
        selectedStatus={selectedStatus}
      />

      <AudioHistoryList audioHistory={filteredAudios} />
      {selectedAudio && <TranscriptModal audio={selectedAudio} />}
    </>
  );
}