export type MeetingExtractionResult = {
  summary: {
    text: string
    highlights: string[]
    todo: string[]
    key_topics: string[]
    sentiment: string
  }
  events: {
    title: string
    description: string
    start_time: string
    end_time: string | null
    location: string | null
  }[]
}

export interface LLMProvider {
  extractMeeting(transcript: string): Promise<MeetingExtractionResult>
}
