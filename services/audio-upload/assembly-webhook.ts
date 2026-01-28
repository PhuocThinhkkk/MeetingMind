import { AudioFileRow } from '@/types/transcription.db'

export async function createAssemblyAudioUploadWithWebhook(
  audio: AudioFileRow
) {
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
  return job
}
