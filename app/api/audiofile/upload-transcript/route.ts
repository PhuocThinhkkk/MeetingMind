import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'

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
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const storagePath = `uploads/${user.id}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('audio')
    .upload(storagePath, file, { contentType: file.type })

  if (uploadError) throw uploadError

  const { data: urlData } = supabaseAdmin.storage
    .from('audio')
    .getPublicUrl(storagePath)

  const { data: audio } = await supabaseAdmin
    .from('audio_files')
    .insert({
      user_id: user.id,
      name: file.name,
      url: urlData.publicUrl,
      transcription_status: 'processing',
    })
    .select()
    .single()

  const res = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      Authorization: process.env.ASSEMBLYAI_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: audio?.url,
      webhook_url: `${process.env.WEBHOOK_BASE_URL}/api/webhooks/assemblyai`,
      webhook_auth_header_name: 'X-Webhook-Secret',
      webhook_auth_header_value: process.env.WEBHOOK_SECRET,
    }),
  })

  const job = await res.json()
  if( !audio) {
      log.error("No audio found")

  return NextResponse.json({
      error: "No audio found"
  }, {status: 404})
  }
      

  await supabaseAdmin
    .from('audio_files')
    .update({ assembly_job_id: job.id })
    .eq('id', audio.id)

  return NextResponse.json({
    audio_id: audio.id,
    status: 'processing',
  })
}

