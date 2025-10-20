import { SaveTranscriptInput, Transcript } from "@/types/transcription.db";
import { supabase } from "@/lib/supabase";


/**
 * Save a transcript for an audio file to the database.
 *
 * @param audioId - The ID of the associated audio file.
 * @param transcripts - Array of transcript segments whose `text` fields will be concatenated and stored.
 * @returns The inserted transcript record from the database.
 * @throws If `transcripts` is empty.
 * @throws If the database insert operation fails.
 */
export async function saveTranscript(
  audioId: string,
  transcripts: SaveTranscriptInput,
) {
  if (!transcripts || transcripts.length === 0) {
    throw new Error('Transcripts array cannot be empty');
  }
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
  return data as Transcript;
}
