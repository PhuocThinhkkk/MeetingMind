'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FileText } from 'lucide-react'

import { TranscriptTab } from '@/components/dashboard/transcription-view/transcript-tab'
import { QATab } from './qa-tab'
import { FileInfoPanel } from './file-info-panel'
import { SummaryTab } from './summary-tab'
import { EventsTab } from './event-tab'
import { ActionPanel } from './action-panel'
import { log } from '@/lib/logger'
import { useTranscriptionView, } from '@/components/context/transcription-view-context'

type Props = {
    open: boolean
    onClose: () => void
}

export function TranscriptionDialog({ open, onClose }: Props) {
    const { audio, transcript } = useTranscriptionView()
    if (!audio || !transcript) {
        if (open) {
            log.error("Unexpected error: TranscriptionDialog opened without required data", { audio: !!audio, transcript: !!transcript })
        }
        return null
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {audio?.name}
                        <Badge>{audio?.transcription_status}</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 gap-6">
                    <div className="flex-1">
                        <Tabs defaultValue="transcript" className="flex flex-col h-full">

                            <TabsList className="grid grid-cols-4">
                                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                                <TabsTrigger value="summary">Summary</TabsTrigger>
                                <TabsTrigger value="qa">Q&A</TabsTrigger>
                                <TabsTrigger value="events">Events</TabsTrigger>
                            </TabsList>

                            <TabsContent value="transcript">
                                <TranscriptTab />
                            </TabsContent>

                            <TabsContent value="summary">
                                <SummaryTab />
                            </TabsContent>

                            <TabsContent value="qa" className='flex flex-col flex-1 min-h-0 overflow-hidden'>
                                <QATab
                                />
                            </TabsContent>

                            <TabsContent value="events">
                                <EventsTab />
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="w-64 space-y-4">
                        <ActionPanel />
                        <FileInfoPanel audioFile={audio} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
