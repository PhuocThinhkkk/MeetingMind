'use client'

import { log } from '@/lib/logger'
import { useEffect, useState } from 'react'
import { TranscriptionDialog } from '@/components/dashboard/transcription-view/transcription-main-view-dialog'
import { TranscriptionDataUpload } from '@/types/transcriptions/transcription.db'
import { getEventAndSumariesByAudioId } from '@/lib/queries/browser/events-sumaries-operations'
import { getAudioById } from '@/lib/queries/browser/audio-operations'
import { getQaLogsByAudioId } from '@/lib/queries/browser/qa-log-operations'
import { getTranscriptByAudioId } from '@/lib/queries/browser/transcription-operations'
import { Button } from '@/components/ui/button'

export default function TranscriptionTestPage() {
    const [open, setOpen] = useState(false)
    const [audioId, setAudioId] = useState<string>("67673f00-8faa-4d5f-a615-4f0a5d0c4ed1")
    const [data, setData] = useState<TranscriptionDataUpload | null>(null)


    useEffect(() => {
        fetchAudioTranscriptionData()
    }, [])
    async function fetchAudioTranscriptionData() {
        const dataAnalyzed = await getEventAndSumariesByAudioId(audioId)
        const audioData = await getAudioById(audioId)
        const qaLogs = await getQaLogsByAudioId(audioId)
        const transcript = await getTranscriptByAudioId(audioId)

        const d = {
            audioFile: audioData,
            qaLogs: qaLogs,
            transcript: transcript,
            summary: dataAnalyzed.summary,
            events: dataAnalyzed.events
        } as TranscriptionDataUpload
        log.info("transcript view props", d)
        setData(d)
        setOpen(true)
    }


    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-semibold">
                Transcription Flow – Test
            </h1>
            <Button onClick={() => {
                setOpen(true)
            }}>click to open dialog</Button>

            {data && (
                <TranscriptionDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    data={data}
                />
            )}
        </div>
    )
}