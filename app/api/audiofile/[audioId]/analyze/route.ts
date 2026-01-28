import { NextRequest, NextResponse } from 'next/server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

/**
 * Generates a structured meeting summary and events from an audio transcription and persists them to the database.
 *
 * Authenticates the requester, verifies ownership and transcription readiness for the specified audio file, avoids duplicate processing, extracts structured JSON (summary and events) from the transcript using the OpenAI chat model, saves the summary and events to the database, and returns the persisted summary and events on success.
 *
 * @param req - The incoming Next.js request
 * @param params - Route parameters object; `params.id` is the audio file ID to analyze
 * @returns On success, a JSON object with `success: true`, `summary` (summary fields: `text`, `highlights`, `todo`, `key_topics`, `sentiment`), and `events` (array of event objects). On failure, a JSON object with an `error` message and an appropriate HTTP status code (e.g., 401, 404, 409).
 * @throws Error if no transcription record is found for the audio file
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const audioId = params.id

  // 1. Auth
  const user = await getUserAuthInSupabaseToken()
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Load audio
  const { data: audio } = await supabaseAdmin
    .from('audio_files')
    .select('*')
    .eq('id', audioId)
    .single()

  if (!audio || audio.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (audio.transcription_status !== 'done') {
    return NextResponse.json({ error: 'Transcript not ready' }, { status: 409 })
  }

  // 3. Idempotency
  const { data: existingSummary } = await supabaseAdmin
    .from('summaries')
    .select('id')
    .eq('audio_id', audioId)
    .maybeSingle()

  if (existingSummary) {
    return NextResponse.json({ success: true })
  }

  // 4. Get transcript
  const { data: transcript } = await supabaseAdmin
    .from('transcripts')
    .select('text')
    .eq('audio_id', audioId)
    .single()

  if (!transcript) {
    throw new Error('No transcription')
  }

  // 5. GPT extraction
  const res = await openai.chat.completions.create({
    model: 'gpt-4.1',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: 'Extract meeting summary and events. Output ONLY valid JSON.',
      },
      {
        role: 'user',
        content: `
Transcript:
${transcript.text}

Return:
{
  "summary": {
    "text": "",
    "highlights": [],
    "todo": [],
    "key_topics": [],
    "sentiment": ""
  },
  "events": [
    {
      "title": "",
      "description": "",
      "start_time": "ISO8601",
      "end_time": "ISO8601 or null",
      "location": null
    }
  ]
}
        `,
      },
    ],
  })

  const parsed = JSON.parse(res.choices[0].message.content!)

  // 6. Save summary
  await supabaseAdmin.from('summaries').insert({
    audio_id: audioId,
    text: parsed.summary.text,
    highlights: parsed.summary.highlights,
    todo: parsed.summary.todo,
    key_topics: parsed.summary.key_topics,
    sentiment: parsed.summary.sentiment,
  })

  // 7. Save events
  for (const event of parsed.events || []) {
    await supabaseAdmin.from('events').insert({
      audio_id: audioId,
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location,
    })
  }

  return NextResponse.json(
    {
      success: true,
      summary: parsed.summary,
      events: parsed.events,
    },
    { status: 200 }
  )
}