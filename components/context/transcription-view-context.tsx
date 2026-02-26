'use client'

import { useCallback, useEffect, useState } from 'react'
import { log } from '@/lib/logger'

import { getAudioById } from '@/lib/queries/browser/audio-operations'
import { getEventAndSumariesByAudioId } from '@/lib/queries/browser/events-sumaries-operations'
import { getQaLogsByAudioId } from '@/lib/queries/browser/qa-log-operations'
import { getTranscriptWordNestedByAudioId } from '@/lib/queries/browser/transcription-operations'

import type {
  QALogRow,
  TranscriptionDataUpload,
} from '@/types/transcriptions/transcription.db'
import type {
  EventItemRow,
} from '@/types/transcriptions/transcription.db'

/**
 * Manages loading and local state for transcription data associated with an audio ID.
 *
 * Loads audio metadata, transcript, summary, events, and QA logs and exposes helpers to
 * refetch data and perform local-first QA log mutations.
 *
 * @param audioId - The audio identifier whose transcription data should be loaded.
 * @returns An object containing:
 *  - `audioId` — the provided audio identifier
 *  - `loading` — whether a fetch is in progress
 *  - `error` — any error encountered while fetching
 *  - `audio` — the loaded audio file metadata or `null`
 *  - `transcript` — the loaded transcript or `null`
 *  - `summary` — the loaded summary or `null`
 *  - `events` — the loaded events array
 *  - `qaLogs` — the loaded QA logs array
 *  - `refetchAll` — function to re-run the full fetch
 *  - `setQaLogs` — function to replace the QA logs array
 *  - `appendQaLog` — function to prepend a QA log (optimistic/local-first)
 *  - `refreshQaLogs` — function to re-fetch QA logs
 */
export function useTranscriptionViewData(audioId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const [audio, setAudio] = useState<
    TranscriptionDataUpload['audioFile'] | null
  >(null)
  const [transcript, setTranscript] = useState<
    TranscriptionDataUpload['transcript'] | null
  >(null)
  const [summary, setSummary] = useState<
    TranscriptionDataUpload['summary'] | null
  >(null)
  const [events, setEvents] = useState<TranscriptionDataUpload['events']>([])
  const [qaLogs, setQaLogs] = useState<TranscriptionDataUpload['qaLogs']>([])

  const fetchAll = useCallback(async () => {
    if (!audioId) return

    setLoading(true)
    setError(null)

    try {
      const [audioData, analyzed, qaLogsData, transcriptData] =
        await Promise.all([
          getAudioById(audioId),
          getEventAndSumariesByAudioId(audioId),
          getQaLogsByAudioId(audioId),
          getTranscriptWordNestedByAudioId(audioId),
        ])

      setAudio(audioData)
      setSummary(analyzed.summary)
      setEvents(analyzed.events)
      setQaLogs(qaLogsData)
      setTranscript(transcriptData)
    } catch (e) {
      log.error('useTranscriptionViewData error', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [audioId])

  /** QA helpers (local-first, optimistic friendly) */
  const appendQaLog = useCallback((qaLog: QALogRow) => {
    setQaLogs(prev => [...prev, qaLog])
  }, [])

  const deleteEvent = useCallback((id: string) => {
    setEvents?.(events.filter((e: EventItemRow) => e.id !== id))
  }, [])

  const updateEvent = useCallback((event: EventItemRow) => {
    setEvents?.(prev =>
      prev.map(e =>
        e.id === event.id ? { ...e, ...event } : e
      )
    )
  }, [])

  const replaceQaLogs = useCallback((logs: QALogRow[]) => {
    setQaLogs(logs)
  }, [])

  const refreshQaLogs = useCallback(async () => {
    try {
      const logs = await getQaLogsByAudioId(audioId)
      setQaLogs(logs)
    } catch (e) {
      log.error('refreshQaLogs error', e)
    }
  }, [audioId])

  const replaceSummary = useCallback(
    (newSummary: TranscriptionDataUpload['summary']) => {
      setSummary(newSummary)
    },
    []
  )
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    audioId,
    loading,
    error,

    audio,
    transcript,
    summary,
    events,
    qaLogs,

    refetchAll: fetchAll,
    setQaLogs: replaceQaLogs,
    appendQaLog,
    refreshQaLogs,
    deleteEvent,
    updateEvent,
  }
}

import { createContext, useContext, ReactNode } from 'react'
type TranscriptionViewContextValue = {
  audioId: string

  audio: TranscriptionDataUpload['audioFile']
  transcript: TranscriptionDataUpload['transcript'] | null
  summary: TranscriptionDataUpload['summary'] | null
  events: TranscriptionDataUpload['events']
  qaLogs: TranscriptionDataUpload['qaLogs']

  loading: boolean
  error: unknown

  appendQaLog: (log: QALogRow) => void
  setQaLogs: (logs: QALogRow[]) => void
  refreshQaLogs: () => Promise<void>
  deleteEvent: (id: string) => void
  updateEvent: (event: EventItemRow) => void
}

const TranscriptionViewContext =
  createContext<TranscriptionViewContextValue | null>(null)

export function TranscriptionViewProvider({
  audioId,
  children,
}: {
  audioId: string
  children: ReactNode
}) {
  const view = useTranscriptionViewData(audioId)

  if (view.error) {
    // Handle error state - throw to error boundary or render error UI
    return null // or return <ErrorFallback error={view.error} />
  }

  if (view.loading || !view.audio) {
    return null // or <Skeleton />
  }
  const value: TranscriptionViewContextValue = {
    audioId,

    audio: view.audio,
    transcript: view.transcript,
    summary: view.summary,
    events: view.events,
    qaLogs: view.qaLogs,

    loading: view.loading,
    error: view.error,

    appendQaLog: view.appendQaLog,
    setQaLogs: view.setQaLogs,
    refreshQaLogs: view.refreshQaLogs,
    deleteEvent: view.deleteEvent,
    updateEvent: view.updateEvent,
  } // all of this damn thing just for prevent nullable in the dialog components, this is the pain in the ass

  return (
    <TranscriptionViewContext.Provider value={value}>
      {children}
    </TranscriptionViewContext.Provider>
  )
}

/**
 * Returns the current TranscriptionViewContext value from the nearest TranscriptionViewProvider.
 *
 * @returns The context value containing audioId, audio, transcript, summary, events, qaLogs, loading, error, and QA helper methods (`appendQaLog`, `setQaLogs`, `refreshQaLogs`).
 * @throws Error if called outside of a TranscriptionViewProvider.
 */
export function useTranscriptionView() {
  const ctx = useContext(TranscriptionViewContext)
  if (!ctx) {
    throw new Error(
      'useTranscriptionView must be used inside TranscriptionViewProvider'
    )
  }
  return ctx
}
