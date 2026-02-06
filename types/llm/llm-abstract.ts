import { PromptBuilder } from './prompt-builder'

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

export abstract class LLMProvider {
  public abstract callLLM(
    prompt: PromptBuilder
  ): Promise<MeetingExtractionResult>

  protected validateTranscript(transcript: string) {
    if (!transcript.trim()) {
      throw new Error('Transcript is empty')
    }
  }

  extractJSON(text: string) {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/)
    if (match) return match[1]
    return text
  }

  protected logUsage(transcript: string, result: MeetingExtractionResult) {
    console.log('Tokens used:', transcript.length)
  }
}
