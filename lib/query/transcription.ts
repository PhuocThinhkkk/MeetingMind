import { SaveTranscriptInput } from "@/types/transcription";
import { supabase } from "@/lib/supabase";


/**
 * Saves a transcript to the database.
 * @param {string} audioId - The ID of the associated audio file.
 * @param {SaveTranscriptInput} transcript - The transcript data to save.
 * @returns {Promise<any>} - The database record of the saved transcript.
 * @throws Will throw an error if the database insert fails.
 */
export async function saveTranscript(
  audioId: string,
  transcripts: SaveTranscriptInput,
) {
    const transcriptText = transcripts.map(t => t.text).join(' ');
  const { data, error } = await supabase
    .from("transcripts")
    .insert({
      audio_id: audioId,
      text: transcriptText,
    })
    .select()
    .single();
  if (error) {
    console.error("Error saving transcript:", error);
    throw error;
  }
  return data;
}
