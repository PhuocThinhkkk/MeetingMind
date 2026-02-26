import { GoogleGenerativeAI } from '@google/generative-ai'
import { LLMProvider, MeetingExtractionResult } from './llm-abstract'
import { log } from '@/lib/logger'
import { PromptBuilder } from './prompt-builder'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export class GeminiLLM extends LLMProvider {
  async callLLM<T>(p: PromptBuilder): Promise<T> {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    })

    const result = await model.generateContent(p.prompt)
    const text = result.response.text()

    let data
    try {
      const cleaned = this.extractJSON(text)
      data = JSON.parse(cleaned)
    } catch (e) {
      log.error('LLM return non JSON text: ', text)
      throw e
    }
    return data
  }
}
