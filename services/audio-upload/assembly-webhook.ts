import { AudioFileRow } from '@/types/transcription.db'
import { log } from '@/lib/logger'

export async function createAssemblyAudioUploadWithWebhook(
  audio: AudioFileRow
) {
  const [ASSEMBLY_KEY, BASE_URL, WEBHOOK_SECRET] = [
    process.env.ASSEMBLY_API_KEY,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.ASSEMBLY_WEBHOOK_SECRET,
  ]
  if (!ASSEMBLY_KEY || !BASE_URL || !ASSEMBLY_KEY) {
    log.error('MISSING KEY')
    throw new Error('Missing api key!')
  }
  const res = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      Authorization: ASSEMBLY_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: audio?.url,
      webhook_url: `${BASE_URL}/api/assemblyai/webhook/transcript`,
      webhook_auth_header_name: 'X-Webhook-Secret',
      webhook_auth_header_value: WEBHOOK_SECRET,
    }),
  })
  const job = await res.json()
  return job
}
