import OpenAI from 'openai'
import { LLMProvider, MeetingExtractionResult } from './llm-abstract'
import { log } from '@/lib/logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export class OpenAILLM implements LLMProvider {
  async extractMeeting(transcript: string): Promise<MeetingExtractionResult> {
    log.info('Using gpt llm')
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 👈 cheap model
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'Extract meeting summary and events. Output ONLY valid JSON.',
        },
        {
          role: 'user',
          content: `
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
          `,
        },
      ],
    })

    return JSON.parse(res.choices[0].message.content!)
  }
}
