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
  language_code?: string
  audio_duration?: number

  words?: AssemblyAIWord[]

  error?: string

  // AssemblyAI-specific webhook metadata
  webhook_status_code?: number
  webhook_auth_header_name?: string
  webhook_auth_header_value?: string
}
