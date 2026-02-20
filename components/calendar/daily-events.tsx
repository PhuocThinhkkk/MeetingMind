'use client'

import { EventItemRow } from '@/types/transcriptions/transcription.db'
import { Clock, MapPin } from 'lucide-react'

interface DailyEventsProps {
  events: EventItemRow[]
  selectedDate: Date
}

export default function DailyEvents({ events, selectedDate }: DailyEventsProps) {
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900">Events Today</h3>
        <p className="text-xs text-slate-500 mt-1">
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-lg bg-slate-50 p-4 text-center">
          <p className="text-sm text-slate-500">No events scheduled for this day</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">
                    {event.title}
                  </h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{formatTime(event.start_time)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`
                    mt-1 inline-flex flex-shrink-0 items-center rounded-full px-2 py-1 text-xs font-medium
                    ${event.added_to_google_calendar
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                    }
                  `}
                >
                  {event.added_to_google_calendar ? '✓ Synced' : 'Pending'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
