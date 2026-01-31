import { OpenAILLM } from './openai'
import { GeminiLLM } from './gemini'
import { LLMProvider } from './llm-abstract'

export function getLLM(): LLMProvider {
  const provider = process.env.LLM_PROVIDER

  if (provider === 'gemini') {
    return new GeminiLLM()
  }

  return new OpenAILLM()
}
