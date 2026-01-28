import { supabase } from '@/lib/supabase-init/supabase-browser'
import { log } from '@/lib/logger'

export async function getQaLogsByAudioId(audioId: string) {
  const { data, error } = await supabase
    .from('qa_logs')
    .select('*')
    .eq('audio_id', audioId)

  if (error) {
    log.error('error: ', error)
    throw new Error(`Error when get qa logs by audio id ${audioId}`)
  }
  return data
}
