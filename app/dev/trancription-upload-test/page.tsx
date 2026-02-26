'use client'

import { log } from '@/lib/logger'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-init/supabase-browser'
import { TranscriptionDialog } from '@/components/dashboard/transcription-view/transcription-main-view-dialog'
import { TranscriptionDataUpload } from '@/types/transcriptions/transcription.db'
import { getAudioById } from '@/lib/queries/browser/audio-operations'
import {
  getTranscriptByAudioId,
  getTranscriptWordNestedByAudioId,
} from '@/lib/queries/browser/transcription-operations'
import { getQaLogsByAudioId } from '@/lib/queries/browser/qa-log-operations'
import { TranscriptionViewProvider } from '@/components/context/transcription-view-context'

export default function TranscriptionTestPage() {
  const [open, setOpen] = useState(false)
  const [audioId, setAudioId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('idle')
  const [data, setData] = useState<TranscriptionDataUpload | null>(null)

  /**
   * Uploads an audio file to start a transcription job and updates component state with the returned audio ID and transcription status.
   *
   * @param file - The audio File to upload under the form field `audio_file`
   */
  async function startTranscription(file: File) {
    const form = new FormData()
    form.append('audio_file', file)

    const res = await fetch('/api/audiofile/upload-transcript', {
      method: 'POST',
      body: form,
    })

    const json = await res.json()

    setAudioId(json.audio_id)
    setStatus(json.status)
  }

  useEffect(() => {
    if (!audioId) return

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
        async payload => {
          const newStatus = payload.new.transcription_status
          setStatus(newStatus)

          if (newStatus === 'done') {
            await analyze(audioId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [audioId])

  /**
   * Trigger server-side analysis for an audio file, assemble the resulting data, and open the transcription dialog.
   *
   * @param audioId - The identifier of the audio file to analyze
   */
  async function analyze(audioId: string) {
    const res = await fetch(`/api/audiofile/${audioId}/analyze`, {
      method: 'POST',
    })

    const { summary, events } = await res.json()

    const [audioFile, transcript, qaLogs] = await Promise.all([
      getAudioById(audioId),
      getTranscriptWordNestedByAudioId(audioId),
      getQaLogsByAudioId(audioId),
    ])

    const data = {
      audioFile,
      transcript: transcript === null ? undefined : transcript,
      summary,
      events,
      qaLogs: qaLogs ?? [],
    }

    log.info('full data transcript: ', data)
    setData(data)

    setOpen(true)
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Transcription Flow – Test</h1>

      <input
        type="file"
        accept="audio/*"
        onChange={e => e.target.files && startTranscription(e.target.files[0])}
      />

      <p className="text-gray-600">
        Status: <b>{status}</b>
      </p>

      {data && (
        <TranscriptionViewProvider audioId={data?.audioFile.id}>
          <TranscriptionDialog open={open} onClose={() => setOpen(false)} />
        </TranscriptionViewProvider>
      )}
    </div>
  )
}
