"use client";
import { AudioHistoryList } from "@/components/audio-history-list";
import { useAuth } from "@/hooks/use-auth";
import { HistoryToolbar } from "@/components/history-toolbar";
import { TranscriptModal } from "@/components/transcript-modal";
import { getAudioHistory } from "@/lib/query/audio";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useAudio } from "@/components/context/audios-list-context";
import { SelectionState } from "react-day-picker";

/**
 * Render the transcript history page that displays the current user's audio recordings and, when an audio is selected via URL, opens its transcript in a modal.
 *
 * The component fetches the authenticated user's audio history and clears the list if no user is present or no recordings are returned.
 *
 * @returns The page JSX containing the header, history toolbar, audio history list, and an optional TranscriptModal for the selected audio.
 */
export default function TranscriptHistoryPage() {
  const { audios, setAudios } = useAudio();
  const { user } = useAuth();

  React.useEffect(() => {
    let cancelled = false;
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
      console.log("Fetched audio history for user", user.id, audios);
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
