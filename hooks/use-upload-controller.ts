import { useState } from 'react'
import { blobToFile } from '@/lib/transcript/blob-to-file'
import { toast } from './use-toast'
const AUDIO_NAME_INIT = 'Unknown name'
import { SaveTranscriptInput } from '@/types/transcriptions/transcription.db'

export type UploadState = 'idle' | 'uploading' | 'error'
export function useUploadController(
  onUpload: (file: File, transcription: SaveTranscriptInput) => Promise<void>
) {
  const [state, setState] = useState<UploadState>('idle')
  const [backupBlob, setBackupBlob] = useState<Blob | null>(null)

  const upload = async (blob: Blob, transcription: SaveTranscriptInput) => {
    try {
      setState('uploading')
      setBackupBlob(blob)

      const file = blobToFile(blob, AUDIO_NAME_INIT)
      await onUpload(file, transcription)

      setState('idle')
      setBackupBlob(null)
      toast({
        title: 'Success',
        description: 'Saved successfully',
        variant: 'default',
      })
    } catch (e) {
      setState('error')
      toast({
        title: 'failed',
        description: 'There is error when saving audio.',
        variant: 'destructive',
      })
    }
  }

  const retry = async (transcription: SaveTranscriptInput) => {
    if (!backupBlob) {
      toast({
        title: 'failed',
        description: 'There is no backup audio found!',
        variant: 'destructive',
      })
      return
    }
    await upload(backupBlob, transcription)
  }

  const dismiss = () => {
    setState('idle')
  }

  return {
    state,
    upload,
    retry,
    dismiss,
  }
}
