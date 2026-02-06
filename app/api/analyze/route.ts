import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { getLLM } from '@/types/llm/llm-factory'
import { buildMeetingSummaryPrompt } from '@/types/llm/prompt-builder'
import { MeetingExtractionResult } from '@/types/llm/llm-abstract'

export async function POST(req: NextRequest) {
  try {
    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { transcript } = await req.json()
    if (!transcript?.text || typeof transcript.text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: transcript.text is required' },
        { status: 400 }
      )
    }

    const llm = getLLM()
    const promptBuilder = buildMeetingSummaryPrompt(transcript.text)
    const parsed = await llm.callLLM<MeetingExtractionResult>(promptBuilder)

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
