import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AudioFileRow } from '@/types/transcriptions/transcription.db'
import { validateAudioTime } from '@/lib/validations/audio-validations'
import { formatDateShorted } from '@/lib/ui-format/time-format'

type Props = {
    audioFile: AudioFileRow
}

export function FileInfoPanel({ audioFile }: Props) {
    const duration = validateAudioTime(audioFile.duration)
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">File Info</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span>
                        {Math.floor(duration / 60)}:
                        {(duration % 60).toString().padStart(2, '0')}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span>
                        {formatDateShorted(audioFile.created_at)}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge>{audioFile.transcription_status}</Badge>
                </div>
            </CardContent>
        </Card>
    )
}
