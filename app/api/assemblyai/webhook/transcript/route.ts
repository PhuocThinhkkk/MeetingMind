import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import {
  findAudioFileByJobId,
  updateAudioComplete,
} from '@/lib/queries/server/audio-upload-operations'

/**
 * Handle AssemblyAI transcript webhook POSTs and update the corresponding local audio record when a transcription completes.
 *
 * @param req - Incoming Next.js request containing the webhook payload and `x-webhook-secret` header
 * @returns A JSON NextResponse: `{ ok: true }` when the webhook is ignored or the audio record is successfully updated; a 401 response when the webhook secret is invalid; a 404 response when no matching audio record is found; a 500 response on internal error.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-webhook-secret')
    const expectedSecret = process.env.WEBHOOK_SECRET

    if (!expectedSecret || secret !== expectedSecret) {
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

    const audio = await findAudioFileByJobId(transcript_id)
    if (!audio) {
      return NextResponse.json({ error: 'Audio not found' }, { status: 404 })
    }

    await updateAudioComplete(audio, transcript)

    return NextResponse.json({ ok: true })
  } catch (e) {
    log.error('error in webhook assembly: ', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}