import { useState } from 'react'
import { blobToFile } from '@/lib/transcript/blob-to-file'
import { toast } from './use-toast'
const AUDIO_NAME_INIT = 'Unknown name'
import { SaveTranscriptInput } from '@/types/transcriptions/transcription.db'

export type UploadState = 'idle' | 'uploading' | 'error'
/**
 * Controls the audio upload lifecycle and exposes actions to upload, retry failed uploads using a backup, and dismiss error state.
 *
 * @param onUpload - Callback invoked with a File and transcription to perform the actual upload; it should return a promise that resolves when the upload completes.
 * @returns An object with:
 *  - `state`: the current upload state (`'idle' | 'uploading' | 'error'`),
 *  - `upload(blob, transcription)`: starts an upload for the given audio `Blob` and transcription,
 *  - `retry(transcription)`: retries the last failed upload using an internal backup `Blob`,
 *  - `dismiss()`: resets the state to `'idle'`.
 */
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
        title: 'Failed to upload audio.',
        description: 'There is no backup audio found!',
        variant: 'destructive',
      })
      return
    }
    await upload(backupBlob, transcription)
  }

  const dismiss = (handleClose: () => void) => {
    setState('idle')
    handleClose()
  }

  return {
    state,
    setState,
    upload,
    retry,
    dismiss,
  }
}
