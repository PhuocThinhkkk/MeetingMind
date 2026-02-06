import { QALogInsert, QALogRow } from '@/types/transcriptions/transcription.db'
import { QALog } from '@/types/utils'

export type QARelation = {
  user_id: string
  audio_id: string
  transcript_id: string
}
export function adaptQA(qaLog: QALog[], relation: QARelation): QALogInsert[] {
  if (!qaLog || qaLog.length === 0) return []

  const res = qaLog.map(qa => ({
    user_id: relation.user_id,
    transcript_id: relation.transcript_id,
    audio_id: relation.audio_id,
    ...qa,
  }))
  return res
}
