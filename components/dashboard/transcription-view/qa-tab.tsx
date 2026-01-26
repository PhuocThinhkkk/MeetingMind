import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDate } from '@/lib/utils'
import { QALogRow } from '@/types/transcription.db'

type Props = {
    qaLogs: QALogRow[]
}

export function QATab({ qaLogs }: Props) {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Q&A</CardTitle>
                <CardDescription>Questions asked about this meeting</CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
                <ScrollArea className="h-[60vh] space-y-4">
                    {qaLogs.length === 0 ? (
                        <p className="text-sm text-gray-500">No questions yet.</p>
                    ) : (
                        qaLogs.map(qa => (
                            <div key={qa.id} className="space-y-2">
                                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                    <p className="text-sm font-medium text-blue-900">
                                        Q: {qa.question}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                    <p className="text-sm text-gray-700">
                                        A: {qa.answer}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {formatDate(qa.created_at)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
