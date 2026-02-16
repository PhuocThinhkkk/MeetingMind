import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
/**
 * Retrieve the transcript row that matches the given audio ID.
 *
 * @param audioId - The value to match against the `audio_id` column in the `transcripts` table
 * @returns The transcript row matching `audioId`, or `null` if the query returned no data
 */
export async function getTranscriptByAudioId(audioId: string) {
  const { data: transcript } = await supabaseAdmin
    .from('transcripts')
    .select('*')
    .eq('audio_id', audioId)
    .single()
  return transcript
}