import { QALogInsert, QALogRow } from '@/types/transcriptions/transcription.db'
import { QALog } from '@/types/utils'
import { log } from '@/lib/logger'

export type QARelation = {
  user_id: string
  audio_id: string
  transcript_id: string
}
/**
 * Attach relation metadata to each QA log entry and produce insert-ready records.
 *
 * @param qaLog - Array of QA log entries to adapt into insert records
 * @param relation - Object supplying `user_id` and `audio_id` to associate with each entry
 * @returns An array of `QALogInsert` objects where each input QA entry is augmented with the relation's `user_id` and `audio_id`
 * @throws Error if `qaLog` is falsy or has no elements
 */
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