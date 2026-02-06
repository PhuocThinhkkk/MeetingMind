'use client'

import { useState } from 'react'
import { TranscriptionDialog } from '@/components/dashboard/transcription-view/transcription-main-view-dialog'
import { Button } from '@/components/ui/button'
import { TranscriptionViewProvider } from '@/components/context/transcription-view-context'

export default function TranscriptionTestPage() {
    const [open, setOpen] = useState(false)
    const [audioId, setAudioId] = useState<string>("62fa7b6b-334b-4885-8720-14f9ec30f0b4")

    return (
        <TranscriptionViewProvider audioId={audioId}>
            <div className="p-8 space-y-6">
                <h1 className="text-2xl font-semibold">
                    Transcription Flow – Test
                </h1>
                <Button onClick={() => {
                    setOpen(true)
                }}>click to open dialog</Button>

                <TranscriptionDialog
                    open={open}
                    onClose={() => setOpen(false)}
                />
            </div>
        </TranscriptionViewProvider>
    )
}