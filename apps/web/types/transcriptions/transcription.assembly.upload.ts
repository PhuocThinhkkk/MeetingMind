export interface AssemblyAIUploadResponse {
  upload_url: string
}

export interface AssemblyAIWord {
  text: string
  start: number
  end: number
  confidence: number
}

export interface AssemblyAIWebhookPayload {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'

  text?: string
  confidence?: number
  language_code?: string // "en_us"
  language_model: string // 'assemblyai_default'
  acoustic_model: string // 'assemblyai_default'
  duration: number //milliseconds
  audio_duration?: number
  audio_url: string

  format_text?: boolean

  words?: AssemblyAIWord[]

  error?: string

  // AssemblyAI-specific webhook metadata
  webhook_status_code?: number
  webhook_auth_header_name?: string
  webhook_auth_header_value?: string
}
