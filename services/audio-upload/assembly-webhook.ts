import { log } from '@/lib/logger'

/**
 * Registers an audio file with AssemblyAI and configures a webhook for transcript delivery.
 *
 * @param audioUrl - The publicly accessible URL of the audio file to transcribe
 * @returns The AssemblyAI transcript job object returned by the API
 * @throws Error if the environment variables ASSEMBLY_API_KEY, NEXT_PUBLIC_APP_URL, or ASSEMBLY_WEBHOOK_SECRET are missing
 * @throws Error if AssemblyAI responds with a non-2xx status (error message includes the HTTP status)
 */
export async function createAssemblyAudioUploadWithWebhook(audioUrl: string) {
  const [ASSEMBLY_KEY, BASE_URL, WEBHOOK_SECRET] = [
    process.env.ASSEMBLY_API_KEY,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.ASSEMBLY_WEBHOOK_SECRET,
  ]
  if (!ASSEMBLY_KEY || !BASE_URL || !WEBHOOK_SECRET) {
    log.error('Missing required environment variable', {
      hasAssemblyKey: !!ASSEMBLY_KEY,
      hasBaseUrl: !!BASE_URL,
      hasWebhookSecret: !!WEBHOOK_SECRET,
    })
    throw new Error('Missing required environment variable')
  }
  const res = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      Authorization: ASSEMBLY_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      webhook_url: `${BASE_URL}/api/assemblyai/webhook/transcript`,
      webhook_auth_header_name: 'X-Webhook-Secret',
      webhook_auth_header_value: WEBHOOK_SECRET,
    }),
  })
  if (!res.ok) {
    const errorBody = await res.text()
    log.error('AssemblyAI API request failed', {
      status: res.status,
      body: errorBody,
    })
    throw new Error(`AssemblyAI API error: ${res.status}`)
  }
  const job = await res.json()
  return job
}