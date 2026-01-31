import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle } from 'lucide-react'
import { EventItemRow } from '@/types/transcriptions/transcription.db'

type Props = {
    events: EventItemRow[]
}

export function EventsTab({ events }: Props) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Extracted Events</CardTitle>
                <CardDescription>AI-detected meetings and deadlines</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                        No events detected.
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-medium">{event.title}</h4>
                                    <p className="text-sm text-gray-500">
                                        {new Date(event.start_time).toLocaleString()}
                                    </p>
                                    {event.location && (
                                        <p className="text-sm text-gray-500">{event.location}</p>
                                    )}
                                </div>

                                {event.added_to_google_calendar ? (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Added
                                    </Badge>
                                ) : (
                                    <Button size="sm" variant="outline">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Add
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
