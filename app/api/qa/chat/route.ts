import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { getLLM } from '@/types/llm/llm-factory'
import { buildQAPrompt } from '@/types/llm/prompt-builder'
import { QALogResult } from '@/types/llm/llm-abstract'

export async function POST(req: NextRequest) {
  try {
    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question, transcript, passQA } = await req.json()
    if (!question?.trim()) {
      return NextResponse.json({ error: 'No question ' }, { status: 400 })
    }
    if (!transcript?.trim()) {
      return NextResponse.json(
        { error: 'No transcript found ' },
        { status: 400 }
      )
    }
    const llm = getLLM()
    const promptBuilder = buildQAPrompt(transcript, question, passQA)
    const parsed = await llm.callLLM<QALogResult>(promptBuilder)

    return NextResponse.json(
      {
        success: true,
        answer: parsed.answer,
        qa: parsed,
      },
      { status: 200 }
    )
  } catch (e) {
    log.error('Analyze transcript error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
