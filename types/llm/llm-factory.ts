import { OpenAILLM } from './openai'
import { GeminiLLM } from './gemini'
import { LLMProvider } from './llm-abstract'

/**
 * Selects and returns an LLM provider implementation based on the LLM_PROVIDER environment variable.
 *
 * @returns An LLMProvider instance: a `GeminiLLM` when `LLM_PROVIDER` is `'gemini'`, otherwise an `OpenAILLM`
 */
export function getLLM(): LLMProvider {
  const provider = process.env.LLM_PROVIDER

  if (provider === 'gemini') {
    return new GeminiLLM()
  }

  return new OpenAILLM()
}