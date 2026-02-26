import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { getLLM } from '@/types/llm/llm-factory'
import { getAudioById } from '@/lib/queries/server/audio-upload-operations'
import { saveSummaryByAudioId } from '@/lib/queries/server/summary-operations'
import { getTranscriptByAudioId } from '@/lib/queries/server/transcript-operations'
import { insertManyEventsByAudioId } from '@/lib/queries/server/events-operations'
import { isAudioFileStatusDone } from '@/services/audio-upload/utils'
import { buildMeetingSummaryPrompt } from '@/types/llm/prompt-builder'
import { MeetingExtractionResult } from '@/types/llm/llm-abstract'

/**
 * Generate a structured meeting summary and events from an audio transcription and persist them.
 *
 * Authenticates the requester, verifies ownership and that transcription is ready for the specified audio file, extracts a parsed summary and events from the transcript, saves the results to the database, and returns the persisted summary and events.
 *
 * @param req - The incoming Next.js request
 * @param params - Promise resolving to route parameters; `params.audioId` is the audio file ID to analyze
 * @returns On success, an object `{ success: true, summary, events }`. On failure, an error object with an appropriate HTTP status (e.g., 401, 404, 409, 500).
 * @throws Error if no transcription record is found for the audio file
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ audioId: string }> }
) {
  try {
    const audioId = (await params).audioId

    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    log.info('audio id: ', audioId)
    const audio = await getAudioById(audioId)

    if (!audio || audio.user_id !== user.id) {
      log.error(`User with id ${user.id} can not access with audio ${audio}`)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!isAudioFileStatusDone(audio)) {
      return NextResponse.json(
        { error: 'Transcript not ready' },
        { status: 409 }
      )
    }

    const transcript = await getTranscriptByAudioId(audioId)
    if (!transcript) {
      throw new Error('No transcription')
    }

    const llm = getLLM()
    const promptBuilder = buildMeetingSummaryPrompt(transcript.text)
    const parsed = await llm.callLLM<MeetingExtractionResult>(promptBuilder)

    await saveSummaryByAudioId(audioId, parsed.summary)
    await insertManyEventsByAudioId(audioId, parsed.events)

    return NextResponse.json(
      {
        success: true,
        summary: parsed.summary,
        events: parsed.events,
      },
      { status: 200 }
    )
  } catch (e) {
    log.error('Analyze transcript error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
