import { supabase } from "@/lib/supabase";
import { getAudioDuration } from "@/lib/utils";

/**
    * Saves an audio Blob to Supabase Storage and records its metadata in the database.
    * @param {Blob} blob - The audio Blob to save.
    * @param {string} userId - The ID of the user uploading the audio.
    * @param {string} name - The name to assign to the audio file.
    * @returns {Promise<any>} - The database record of the saved audio file.
    * @throws Will throw an error if the upload or database insert fails.
    */

export async function saveAudioFile(
  blob: Blob,
  userId: string,
  name: string,
) {

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

  const duration = await getAudioDuration(blob);

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

  return data;
}
