'use client'
import { log } from '@/utils/logger'
import { useTranscriptDebug } from './hooks/useTranscriptDebug'
import RealTimeTranscriptionPage from '@/components/dashboard/realtime-transcription/realtime-view-transcription'

export default function TranscriptionTestPage() {
  const debug = useTranscriptDebug()

  log.info('DEBUG STATE: ', debug)
  return (
    <RealTimeTranscriptionPage
      transcriptState={{
        transcriptTurns: debug.transcriptTurns,
        translateTurns: debug.translateTurns,
      }}
      isVisible
      onExit={() => {}}
      onStopRecording={() => {}}
    />
  )
}
