import { log } from "@/lib/logger";
import { supabase } from "@/lib/supabase";
import { getAudioDuration } from "@/lib/transcriptionUtils";
import { AudioFile } from "@/types/transcription.db";

/**
 * Retrieve a user's audio history with each item's primary transcript normalized.
 *
 * Results are ordered by creation time descending. For each audio record the
 * `transcript` field is set to the first related transcript object and is
 * guaranteed to include a `words` array (empty if the transcript had no words).
 *
 * @param userId - The user id to filter audio records by
 * @returns An array of `AudioFile` records where each `transcript` is the first related transcript object containing a `words` array
 */
export async function getAudioHistory(userId: string): Promise<AudioFile[]> {
  const { data, error } = await supabase
    .from("audio_files")
    .select(
      `
      *,
      transcript:transcripts(
        *,
        words:transcription_words!fk_transcript(*)
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    log.error("Error fetching audio history:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    log.warn("No audio found! Data:", data);
    return [];
  }

  try {
    const audiosFormatted = data.map((audio) => {
      let transcript: any = { words: [] };

      if (
        audio.transcript &&
        audio.transcript.length > 0 &&
        audio.transcript[0]
      ) {
        transcript = audio.transcript[0];

        if (!transcript.words) {
          transcript.words = [];
        }
      }

      const formattedTranscript = {
        ...transcript,
        words: transcript.words,
      };

      return { ...audio, transcript: formattedTranscript };
    }) as AudioFile[];

    return audiosFormatted;
  } catch (e) {
    throw new Error(`can not format audio: ${e}`);
  }
}

/**
 * Store an audio Blob in Supabase Storage and create a corresponding metadata record in the `audio_files` table.
 *
 * Attempts to compute the audio duration; if duration calculation fails or is unavailable, the duration is set to 0. The stored record will include a public URL, rounded duration, file size, MIME type, and a transcription status of `"done"`.
 *
 * @param blob - The audio data to upload
 * @param userId - The owning user's ID used to build the storage path
 * @param name - A base name for the file; a timestamp and `.wav` extension are appended to form the stored filename
 * @returns The created `AudioFile` record inserted into `audio_files`
 * @throws If the storage upload fails or the database insert fails
 */

export async function saveAudioFile(blob: Blob, userId: string, name: string) {
  const mimeType = blob.type;
  const fileSize = blob.size;

  const filePath = `recordings/${userId}/${Date.now()}-${name}.wav`;

  const { error: uploadError } = await supabase.storage
    .from("audio-files")
    .upload(filePath, blob, {
      contentType: mimeType,
    });

  if (uploadError) {
    log.error("Upload error:", uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from("audio-files")
    .getPublicUrl(filePath);

  const url = publicUrlData.publicUrl;

  let duration;
  try {
    duration = await getAudioDuration(blob);
  } catch (err) {
    log.error("Error when saving audio file: ", err);
  }
  if (duration == undefined) {
    duration = 0;
  }

  const { data, error } = await supabase
    .from("audio_files")
    .insert({
      user_id: userId,
      name,
      url,
      duration: Math.round(duration),
      file_size: fileSize,
      mime_type: mimeType,
      transcription_status: "done",
    })
    .select()
    .single();

  if (error) {
    log.error("DB insert error:", error);
    throw error;
  }

  return data as AudioFile;
}

/**
 * Update an audio file's name and refresh its `updated_at` timestamp in the database.
 *
 * @param audioId - The ID of the audio file to update
 * @param newName - The new name to assign to the audio file
 * @returns The updated `AudioFile` record
 * @throws Supabase error when the update operation fails
 */
export async function updateAudioName(audioId: string, newName: string) {
  const { data, error } = await supabase
    .from("audio_files")
    .update({ name: newName, updated_at: new Date().toISOString() })
    .eq("id", audioId)
    .select()
    .single();

  if (error) {
    log.error("❌ Error updating audio name:", error);
    throw error;
  }

  log.info("✅ Audio name updated:", data);
  return data as AudioFile;
}

/**
 * Delete an audio file record by its ID.
 *
 * @param audioId - The ID of the audio file to delete
 * @returns `true` if the record was deleted
 * @throws The Supabase error returned when the delete operation fails
 */
export async function deleteAudioById(audioId: string) {
  const { error } = await supabase
    .from("audio_files")
    .delete()
    .eq("id", audioId);

  if (error) {
    log.error("❌ Error deleting audio:", error);
    throw error;
  }

  log.info(`🗑️ Audio with ID ${audioId} deleted`);
  return true;
}
