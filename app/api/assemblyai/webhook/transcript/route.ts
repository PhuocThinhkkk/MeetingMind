import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret')

  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { transcript_id, status } = await req.json()

  if (status !== 'completed') {
    return NextResponse.json({ ok: true })
  }

  const res = await fetch(
    `https://api.assemblyai.com/v2/transcript/${transcript_id}`,
    {
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY!,
      },
    }
  )

  const transcript = await res.json()

  const { data: audio } = await supabaseAdmin
    .from('audio_files')
    .select('id')
    .eq('assembly_job_id', transcript_id)
    .single()

  if (!audio) {
    return NextResponse.json({ error: 'Audio not found' }, { status: 404 })
  }

  await supabaseAdmin.from('transcripts').insert({
    audio_id: audio.id,
    text: transcript.text,
    language: transcript.language_code ?? 'en-US',
    confidence_score: transcript.confidence,
  })

  await supabaseAdmin
    .from('audio_files')
    .update({ transcription_status: 'done' })
    .eq('id', audio.id)

  return NextResponse.json({ ok: true })
}

