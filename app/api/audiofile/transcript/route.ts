import { NextRequest, NextResponse } from 'next/server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import { log } from '@/lib/logger'

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/webm',
  'audio/mp4',
  'audio/m4a',
]

export async function POST(req: NextRequest) {
  try {
    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('audio_file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type (audio only)' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop()
    const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('audio')
      .upload(storagePath, file, { contentType: file.type })

    if (uploadError) throw uploadError

    const { data: urlData } = supabaseAdmin.storage
      .from('audio')
      .getPublicUrl(storagePath)

    const { data: audio, error: audioErr } = await supabaseAdmin
      .from('audio_files')
      .insert({
        user_id: user.id,
        name: file.name,
        url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
        transcription_status: 'processing',
      })
      .select()
      .single()

    if (audioErr) throw audioErr

    const createRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audio.url,
        speaker_labels: true,
      }),
    })

    const job = await createRes.json()

    // ⚠️ MVP polling (replace with webhook later)
    let transcript
    while (true) {
      const pollRes = await fetch(
        `https://api.assemblyai.com/v2/transcript/${job.id}`,
        {
          headers: {
            Authorization: process.env.ASSEMBLYAI_API_KEY!,
          },
        }
      )

      transcript = await pollRes.json()

      if (transcript.status === 'completed') break
      if (transcript.status === 'error') {
        throw new Error(transcript.error)
      }

      await new Promise(r => setTimeout(r, 3000))
    }

    await supabaseAdmin.from('transcripts').insert({
      audio_id: audio.id,
      text: transcript.text,
      language: transcript.language_code ?? 'en-US',
      confidence_score: transcript.confidence,
      speakers_detected: transcript.speaker_labels ? 2 : 1,
    })

    await supabaseAdmin
      .from('audio_files')
      .update({ transcription_status: 'done' })
      .eq('id', audio.id)

    return NextResponse.json({
      success: true,
      audio_id: audio.id,
      transcript: transcript.text,
    })
  } catch (err) {
    log.error('Transcription error', err)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
