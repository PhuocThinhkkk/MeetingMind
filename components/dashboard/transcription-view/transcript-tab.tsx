import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, User } from 'lucide-react'
import { AudioFileRow, TranscriptRow } from '@/types/transcription.db'
import { validateAudioTime } from '@/lib/validations/audio-validations'

type Props = {
    transcript?: TranscriptRow
    audioFile: AudioFileRow
}

export function TranscriptTab({ transcript, audioFile }: Props) {
    if (!transcript) {
        return <p className="text-gray-500">No transcript available.</p>
    }
    const duration = validateAudioTime(audioFile.duration)

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Full Transcript</CardTitle>

                <div className="flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {Math.floor(duration / 60)}:
                        {(duration % 60).toString().padStart(2, '0')}
                    </span>

                    <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {transcript.speakers_detected} speakers
                    </span>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-[60vh] space-y-3 text-sm">
                    {transcript.text
                        .split('\n')
                        .filter(Boolean)
                        .map((line, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded">
                                {line}
                            </div>
                        ))}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
