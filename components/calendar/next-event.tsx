'use client'

import { EventItemRow } from '@/types/transcriptions/transcription.db'
import { Clock, MapPin, Zap } from 'lucide-react'

interface NextEventProps {
  event: EventItemRow
}

export default function NextEvent({ event }: NextEventProps) {
  const formatDateTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getTimeUntil = (date: string) => {
    const now = new Date()
    const eventTime = new Date(date)
    const diff = eventTime.getTime() - now.getTime()

    if (diff < 0) return 'Started'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `In ${days} day${days > 1 ? 's' : ''}`
    }
    if (hours > 0) {
      return `In ${hours}h ${minutes}m`
    }
    return `In ${minutes}m`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-slate-900">Next Event</h3>
      </div>

      <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-4">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-slate-900">{event.title}</h4>
            <p className="text-xs text-slate-500 mt-1">{getTimeUntil(event.start_time)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Clock className="h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>{formatDateTime(event.start_time)}</span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <MapPin className="h-4 w-4 flex-shrink-0 text-blue-600" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {event.description && (
            <div className="pt-2 border-t border-blue-200">
              <p className="text-xs text-slate-600 line-clamp-2">{event.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
