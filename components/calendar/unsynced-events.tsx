'use client'

import { useState } from 'react'
import { Clock, MapPin, Calendar, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventItemRow } from '@/types/transcriptions/transcription.db'

interface UnsyncedEventsProps {
  events: EventItemRow[]
}

export default function UnsyncedEvents({ events }: UnsyncedEventsProps) {
  const [syncedIds, setSyncedIds] = useState<string[]>([])

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleSync = (eventId: string) => {
    setSyncedIds(prev => [...prev, eventId])
    // Here you would call the API to sync with Google Calendar
  }

  const unsyncedList = events.filter(e => !syncedIds.includes(e.id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Add to Google Calendar</h3>
          <p className="text-sm text-slate-600 mt-1">
            {unsyncedList.length} event{unsyncedList.length !== 1 ? 's' : ''} ready to sync
          </p>
        </div>
        {unsyncedList.length > 0 && (
          <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            Pending
          </div>
        )}
      </div>

      {unsyncedList.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <Check className="h-12 w-12 mx-auto text-green-500 mb-3" />
          <p className="text-sm font-medium text-slate-900">All synced!</p>
          <p className="text-xs text-slate-500 mt-1">Your events are up to date with Google Calendar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unsyncedList.map(event => (
            <div
              key={event.id}
              className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900">{event.title}</h4>

                  {event.description && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{event.description}</p>
                  )}

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Calendar className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      <span>{formatDateTime(event.start_time)}</span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleSync(event.id)}
                  size="sm"
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Sync
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
