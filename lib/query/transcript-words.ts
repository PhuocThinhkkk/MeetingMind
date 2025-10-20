import { RealtimeTranscriptionWord } from "@/types/transcription.ws";
import { TranscriptionWord } from "@/types/transcription.db";
import { supabase } from "../supabase";

export async function saveTranscriptWords(
  transcriptionId: string,
  transcriptWords: RealtimeTranscriptionWord[]
) {
  const rows = transcriptWords.map((word) => ({
    transcript_id: transcriptionId,
    text: word.text,
    confidence: word.confidence,
    start_time: word.start,
    end_time: word.end,
    word_is_final: word.word_is_final,
  }));

  const { data, error } = await supabase.from("transcription_words").insert(rows).select();

  if (error) {
    throw new Error("Error when saving transcript words: " + error.message);
  }
  if(!data) return []
  return data as TranscriptionWord[];
}

