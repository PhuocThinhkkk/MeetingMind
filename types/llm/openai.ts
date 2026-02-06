import OpenAI from 'openai'
import { LLMProvider, MeetingExtractionResult } from './llm-abstract'
import { log } from '@/lib/logger'
import { PromptBuilder } from './prompt-builder'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export class OpenAILLM extends LLMProvider {
  async callLLM(p: PromptBuilder): Promise<MeetingExtractionResult> {
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
          ${p.prompt}

          `,
        },
      ],
    })

    return JSON.parse(res.choices[0].message.content!)
  }
}
