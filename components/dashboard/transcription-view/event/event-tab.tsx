"use client"
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle, Trash2, Pencil } from 'lucide-react'
import { useTranscriptionView } from '@/components/context/transcription-view-context'
import { useRouter } from 'next/navigation'
import { EditEventModal } from './edit-event-modal'
import { useToast } from '@/hooks/use-toast'
import { EventItemRow } from '@/types/transcriptions/transcription.db'
import { deleteEventById } from '@/lib/queries/browser/events-sumaries-operations'

export function EventsTab() {
  const { events, deleteEvent, updateEvent } = useTranscriptionView()
  const router = useRouter()
  const { toast } = useToast()
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const selectedEvent = events.find((e: EventItemRow) => e.id === selectedEventId)

  const handleDelete = async (id: string) => {
    try {
      await deleteEventById(id)
      deleteEvent(id)
      toast({ title: 'Deleted', description: 'Event removed' })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      })
    }
  }

  const handleEventUpdated = (updatedEvent: EventItemRow) => {
    updateEvent(updatedEvent)
    setSelectedEventId(null)
  }
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
          events.map((event) => (
            <div key={event.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(event.start_time).toLocaleString()}
                  </p>
                  {event.location && (
                    <p className="text-sm text-gray-500">{event.location}</p>
                  )}
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {event.added_to_google_calendar ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Added
                    </Badge>
                  ) : (
                    <Button onClick={() => { router.push("/calendar") }} size="sm" variant="outline">
                      <Calendar className="w-4 h-4 mr-1" />
                      Sync
                    </Button>
                  )}
                  <Button
                    onClick={() => setSelectedEventId(event.id)}
                    size="sm"
                    variant="ghost"
                    title="Edit event"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {/*
                  <Button
                    onClick={() => handleDelete(event.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  */}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <EditEventModal
        open={!!selectedEventId}
        event={selectedEvent ?? null}
        onOpenChange={(open) => !open && setSelectedEventId(null)}
        onEventUpdated={handleEventUpdated}
      />
    </Card>
  )
}

