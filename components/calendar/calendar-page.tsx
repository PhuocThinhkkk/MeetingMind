'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import DatePicker from './date-picker'
import DailyEvents from './daily-events'
import NextEvent from './next-event'
import UnsyncedEvents from './unsynced-events'
import type { EventItemRow } from '@/types/transcriptions/transcription.db'

export default function CalendarEntry({ events }: { events: EventItemRow[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const selectedDateEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time)
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      )
    })
  }, [selectedDate])

  const upcomingEvents = useMemo(() => {
    return events
      .filter(event => new Date(event.start_time) >= new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }, [])

  const unsyncedEvents = useMemo(() => {
    return events.filter(event => !event.added_to_google_calendar)
  }, [])

  return (
    <div className="mx-auto max-w-8xl">
      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Calendar & Events */}
        <div className="lg:col-span-1 space-y-6">
          {/* Date Picker Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <DatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          {/* Daily Events Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <DailyEvents events={selectedDateEvents} selectedDate={selectedDate} />
          </div>

          {/* Next Event Card */}
          {upcomingEvents.length > 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <NextEvent event={upcomingEvents[0]} />
            </div>
          )}
        </div>

        {/* Right Panel - Unsynced Events */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <UnsyncedEvents events={unsyncedEvents} />
          </div>
        </div>
      </div>
    </div>
  )
}
