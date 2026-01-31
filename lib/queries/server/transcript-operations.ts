import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
export async function getTranscriptByAudioId(audioId: string) {
  const { data: transcript } = await supabaseAdmin
    .from('transcripts')
    .select('*')
    .eq('audio_id', audioId)
    .single()
  return transcript
}
