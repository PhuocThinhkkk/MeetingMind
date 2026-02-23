import { EventItemRow } from '@/types/transcriptions/transcription.db'

/**
 * Converts an EventItemRow into a Google Calendar all-day event object.
 *
 * @param event - Source event; `start_time` must be an ISO datetime string (e.g., "YYYY-MM-DDTHH:MM:SS") used to derive the all-day date.
 * @returns An object containing `summary`, `description`, `location`, and `start`/`end` as `{ date: "YYYY-MM-DD" }` where `end.date` is the day after `start.date`.
 */
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