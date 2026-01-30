import { GoogleGenerativeAI } from '@google/generative-ai'
import { LLMProvider, MeetingExtractionResult } from './llm-abstract'
import { log } from '@/lib/logger'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export class GeminiLLM implements LLMProvider {
  async extractMeeting(transcript: string): Promise<MeetingExtractionResult> {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    })

    const prompt = `
Extract meeting summary and events.
Output ONLY valid JSON.

Transcript:
${transcript}

Return:
{
  "summary": {
    "text": "",
    "highlights": [],
    "todo": [],
    "key_topics": [],
    "sentiment": ""
  },
  "events": [
    {
      "title": "",
      "description": "",
      "start_time": "ISO8601",
      "end_time": "ISO8601 or null",
      "location": null
    }
  ]
}
    `

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    let data
    try {
      const cleaned = extractJSON(text)
      data = JSON.parse(cleaned)
    } catch (e) {
      log.error('LLM return non JSON text: ', text)
      throw e
    }
    return data
  }
}

function extractJSON(text: string) {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/)
  if (match) return match[1]
  return text
}
