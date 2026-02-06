'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { QALogRow, TranscriptRow } from '@/types/transcriptions/transcription.db'
import { QALog } from '@/types/utils'
import { toast } from 'sonner'
import { getQaLogsByAudioId, insertQALogs } from '@/lib/queries/browser/qa-log-operations'
import { log } from '@/lib/logger'
import { useAuth } from '@/hooks/use-auth'
import { useTranscriptionView } from '@/components/context/transcription-view-context'

type QALogInit = QALog | QALogRow

type QALogUI = {
    question: string
    answer: string
    created_at?: string
}


export function QATab() {
    const { user } = useAuth()
    const { qaLogs, appendQaLog, setQaLogs, transcript, audioId } = useTranscriptionView()
    const [question, setQuestion] = useState('')
    const [loading, setLoading] = useState(false)

    const now = new Date()

    function toQALogUI(log: QALogInit): QALogUI {
        return {
            question: log.question,
            answer: log.answer,
            created_at: 'created_at' in log ? log.created_at as string : now.toISOString()
        }
    }



    const handleAsk = async () => {
        try {
            if (!question.trim()) return
            if (!user) return
            if (!transcript?.text.trim()) {
                throw new Error("Some how transcript no where to be found")

            }

            setLoading(true)
            const last5QAlogs = qaLogs.slice(-5)
            const res = await fetch('/api/qa/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, transcript, passQA: last5QAlogs }),
            })

            if (!res.ok) throw new Error('Failed to ask question')

            const data = await res.json()
            if (!data.qa) throw new Error('Invalid response from server')

            const relation = {
                user_id: user.id,
                audio_id: audioId,
                transcript_id: transcript.id
            }

            await insertQALogs(data, relation)
            appendQaLog(data.qa)
            setQuestion('')

        } catch (err) {
            console.error(err)
            toast.error(`${err}`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchQALogs()
        async function fetchQALogs() {
            try {
                const qaLogs = await getQaLogsByAudioId(audioId)
                setQaLogs(qaLogs)
            } catch (e) {
                log.error("Error in fetching audio id: ", e)
            }
        }

    }, [audioId])


    return (
        <Card className="h-full flex flex-col min-h-0">
            <CardHeader>
                <CardTitle>Q&A</CardTitle>
                <CardDescription>Questions asked about this meeting</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 gap-4">
                {/* Chat history */}
                <ScrollArea className="h-[450px] pr-4">
                    {qaLogs.length === 0 ? (
                        <p className="text-sm text-gray-500">No questions yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {qaLogs.map((qa, index) => {
                                const qaUI = toQALogUI(qa);
                                return (

                                    <div key={index} className="space-y-2">

                                        {/* Question */}
                                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                            <p className="text-sm font-medium text-blue-900">
                                                Q: {qaUI.question}
                                            </p>
                                        </div>

                                        {/* Answer */}
                                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                            <p className="text-sm text-gray-700">
                                                A: {qaUI.answer ?? 'Thinking...'}
                                            </p>
                                            {qaUI.created_at && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {formatDate(qaUI.created_at)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>

                <div className="flex gap-2 pt-2 border-t">
                    <Input
                        placeholder="Ask a question..."
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleAsk()
                        }}
                        disabled={loading}
                    />
                    <Button onClick={handleAsk} disabled={loading}>
                        {loading ? 'Asking...' : 'Ask'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

