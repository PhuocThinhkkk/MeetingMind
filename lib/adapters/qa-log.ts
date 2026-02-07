import { QALogInsert, QALogRow } from '@/types/transcriptions/transcription.db'
import { QALog } from '@/types/utils'
import { log } from '@/lib/logger'

export type QARelation = {
  user_id: string
  audio_id: string
  transcript_id: string
}
export function adaptQA(qaLog: QALog[], relation: QARelation): QALogInsert[] {
  if (!qaLog || qaLog.length === 0) {
    log.error('qa logs array error:  ', { qaLog })
    throw new Error('The qa logs array is wrong in adapt function')
  }

  const res = qaLog.map(qa => ({
    user_id: relation.user_id,
    // will implement transcript relation later
    audio_id: relation.audio_id,
    ...qa,
  }))
  return res
}
