import { Transcript_Word, TranscriptionWord } from "@/types/transcription";
import { supabase } from "../supabase";

export async function saveTranscriptWords(
  transcriptionId: string,
  transcriptWords: TranscriptionWord[]
) {
  const rows = transcriptWords.map((word) => ({
    transcript_id: transcriptionId,
    text: word.text,
    confidence: word.confidence,
    start_time: word.start,
    end_time: word.end,
    word_is_final: word.word_is_final,
  }));

  const { data, error } = await supabase.from("transcription_words").insert(rows);

  if (error) {
    throw new Error("Error when saving transcript words: " + error.message);
  }
  if(!data) return []
  return data as Transcript_Word[];
}

