import { saveAudioFile } from '@/lib/queries/browser/audio-operations'
import { CreateUrlUploadBody } from '@/app/api/audiofile/create-url-upload/route'
import { CreateUploadUrlResult } from '@/types/transcriptions/transcription.storage.upload'
import { TriggerTranscriptBody } from '@/app/api/audiofile/trigger-transcript/route'
import { GetUrlDownloadBody } from '@/app/api/audiofile/get-url-download/route'
import { supabase } from '@/lib/supabase-init/supabase-browser'

async function fetchPresignedUrl(input: CreateUrlUploadBody) {
  const res = await fetch('/api/audiofiles/create-url-upload', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(
      `Error when creating url upload: ${(await res.json()).error}`
    )
  }
  const data: CreateUploadUrlResult = await res.json()
  return data
}

export async function fetchPresignedUrlAndUpload(
  input: CreateUrlUploadBody,
  file: File,
  userId: string
) {
  const uploadRes = await fetchPresignedUrl(input)
  const audio = await saveAudioFile(file, userId, uploadRes)
  return { path: uploadRes.path, audio: audio }
}

export async function fetchTriggerTranscript(input: TriggerTranscriptBody) {
  const res = await fetch('/api/audiofiles/trigger-transcript', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(
      `Error when trigger transcript: ${(await res.json()).error}`
    )
  }
  const data: CreateUploadUrlResult = await res.json()
  return data
}

export async function fetchUrlDownload(input: GetUrlDownloadBody) {
  const res = await fetch('/api/audiofiles/get-url-download', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(
      `Error when fetching url download: ${(await res.json()).error}`
    )
  }
  const data: CreateUploadUrlResult = await res.json()
  return data
}

export async function waitForTranscriptionDone(audioId: string): Promise<void> {
  const { data } = await supabase
    .from('audio_files')
    .select('transcription_status')
    .eq('id', audioId)
    .single()

  if (data?.transcription_status === 'done') return
  if (data?.transcription_status === 'failed') {
    throw new Error('Transcription failed')
  }

  return new Promise((resolve, reject) => {
    const channel = supabase
      .channel(`audio-status-${audioId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'audio_files',
          filter: `id=eq.${audioId}`,
        },
        payload => {
          const status = payload.new.transcription_status

          if (status === 'done') {
            supabase.removeChannel(channel)
            resolve()
          }

          if (status === 'failed') {
            supabase.removeChannel(channel)
            reject(new Error('Transcription waiting failed'))
          }
        }
      )
      .subscribe()
  })
}

export async function triggerAnalyze(audioId: string) {
  const res = await fetch(`/api/audiofile/${audioId}/analyze`, {
    method: 'POST',
  })
  if (!res.ok) {
    throw new Error(
      `Error when trigger analyzing : ${(await res.json()).error}`
    )
  }
  const data = await res.json()
  return data
}
