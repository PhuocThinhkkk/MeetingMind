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

import { TranscriptionDataUpload } from '@/types/transcriptions/transcription.db'
import { TranscriptTab } from '@/components/dashboard/transcription-view/transcript-tab'
import { QATab } from './qa-tab'
import { FileInfoPanel } from './file-info-panel'
import { SummaryTab } from './summary-tab'
import { EventsTab } from './event-tab'
import { ActionPanel } from './action-panel'

type Props = {
    open: boolean
    onClose: () => void
    data: TranscriptionDataUpload
}

export function TranscriptionDialog({ open, onClose, data }: Props) {
    const { audioFile } = data

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {audioFile.name}
                        <Badge>{audioFile.transcription_status}</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 h-full gap-6">
                    <div className="flex-1">
                        <Tabs defaultValue="transcript" className="h-full">
                            <TabsList className="grid grid-cols-4">
                                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                                <TabsTrigger value="summary">Summary</TabsTrigger>
                                <TabsTrigger value="qa">Q&A</TabsTrigger>
                                <TabsTrigger value="events">Events</TabsTrigger>
                            </TabsList>

                            <TabsContent value="transcript">
                                <TranscriptTab
                                    transcript={data.transcript}
                                    audioFile={audioFile}
                                />
                            </TabsContent>

                            <TabsContent value="summary">
                                <SummaryTab summary={data.summary} />
                            </TabsContent>

                            <TabsContent value="qa">
                                <QATab qaLogs={data.qaLogs} />
                            </TabsContent>

                            <TabsContent value="events">
                                <EventsTab events={data.events} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="w-64 space-y-4">
                        <ActionPanel />
                        <FileInfoPanel audioFile={audioFile} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
