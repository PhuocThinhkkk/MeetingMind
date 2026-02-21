import { EventItemRow } from '@/types/transcriptions/transcription.db'

export function toAllDayEvent(event: EventItemRow) {
  const startDate = event.start_time.split('T')[0]

  const end = new Date(startDate)
  end.setDate(end.getDate() + 1)

  const endDate = end.toISOString().split('T')[0]

  return {
    summary: event.title,
    description: event.description,
    location: event.location,
    start: { date: startDate },
    end: { date: endDate },
  }
}
