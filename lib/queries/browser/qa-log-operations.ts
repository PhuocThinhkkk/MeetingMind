import { supabase } from '@/lib/supabase-init/supabase-browser'
import { log } from '@/lib/logger'
import { QALog } from '@/types/utils'
import { adaptQA, QARelation } from '@/lib/adapters/qa-log'

/**
 * Fetches QA log records for the specified audio ID.
 *
 * @param audioId - The audio ID used to filter QA logs.
 * @returns The array of QA log records matching `audioId`.
 * @throws Error if the database query fails.
 */
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

export async function insertQALogs(qaLogs: QALog[], data: QARelation) {
  const insertedData = adaptQA(qaLogs, data)
  const { error } = await supabase
    .from('qa_logs')
    .insert(insertedData)
    .select('*')

  if (error) {
    log.error('There was an error when inserting qa log', {
      qaLogs,
      data,
      error,
    })
    throw error
  }
}
