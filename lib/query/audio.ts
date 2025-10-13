import { supabase } from "@/lib/supabase";
import { getAudioDuration } from "@/lib/utils";
import { AudioFile } from "@/types/transcription";

/**
 * Retrieve a user's audio history including their associated transcript (if any).
 *
 * The results are ordered by creation time descending. Each returned item’s
 * `transcript` field is normalized to the first related transcript object or `null`.
 *
 * @param userId - The user id to filter audio records by
 * @returns An array of `AudioFile` objects with normalized `transcript` values
 */
export async function getAudioHistory(userId: string): Promise<AudioFile[]> {
  const { data, error } = await supabase
    .from("audio_files")
    .select("*, transcript:transcripts(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching audio history:", error);
    return [];
  }
  if (!data || data.length === 0) {
    console.warn("no audio found! Data: ", data);
  }

  const audiosFormatted = data.map((item) => ({
    ...item,
    transcript: item.transcript?.[0] ?? null,
  })) as AudioFile[];

  return audiosFormatted;
}

/**
 * Save an audio Blob to Supabase Storage and record its metadata in the database.
 *
 * @returns The created `AudioFile` record inserted into the `audio_files` table
 * @throws The Supabase upload error or database insertion error if the storage upload or DB insert fails
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
    console.error("Upload error:", uploadError);
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
    console.error("Error when saving audio file: ", err);
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
    console.error("DB insert error:", error);
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
    console.error("❌ Error updating audio name:", error);
    throw error;
  }

  console.log("✅ Audio name updated:", data);
  return data as AudioFile;
}

/**
 * Delete an audio file record by its ID.
 *
 * @param audioId - The ID of the audio record to delete
 * @returns `true` if the record was deleted
 * @throws The database error when the delete operation fails
 */
export async function deleteAudioById(audioId: string) {
  const { error } = await supabase
    .from("audio_files")
    .delete()
    .eq("id", audioId);

  if (error) {
    console.error("❌ Error deleting audio:", error);
    throw error;
  }

  console.log(`🗑️ Audio with ID ${audioId} deleted`);
  return true;
}