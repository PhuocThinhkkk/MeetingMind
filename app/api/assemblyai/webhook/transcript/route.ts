import { NextRequest, NextResponse } from 'next/server'
import { log } from '@/lib/logger'
import {
  findAudioFileByJobId,
  updateAudioComplete,
} from '@/lib/queries/server/audio-upload-operations'

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
