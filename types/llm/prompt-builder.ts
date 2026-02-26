import { QALog } from '../utils'

export type PromptBuilder = {
  prompt: string
}

/**
 * Builds a prompt that instructs an AI to extract a meeting summary and calendar events from a transcript and to output only valid JSON.
 *
 * @returns An object with a `prompt` string that embeds the provided transcript and specifies the required JSON schema for `summary` (including `text`, `highlights`, `todo`, `key_topics`, and `sentiment`) and `events` (objects with `title`, `description`, `start_time`, `end_time`, and `location`).
 */
export function buildMeetingSummaryPrompt(transcript: string): PromptBuilder {
  return {
    prompt: `
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
`,
  }
}
/**
 * Constructs a prompt that asks an LLM to answer a specific question using a meeting transcript and optional past QA context.
 *
 * The prompt instructs the model to output only valid JSON with the schema:
 * {
 *   "question": "<the provided question>",
 *   "answer": "<model's answer or \"Not enough information.\">",
 *   "confidence_score": <number>
 * }
 *
 * @param transcript - The meeting transcript to be used as the source of truth.
 * @param question - The question to answer based on the transcript.
 * @param passQA - Optional past question/answer context; when provided it is serialized to JSON and included as "Past conversation".
 * @returns An object with a `prompt` string that embeds the transcript, question, and past conversation and instructs the model to return the specified JSON structure.
 */
export function buildQAPrompt(
  transcript: string,
  question: string,
  passQA?: QALog
): PromptBuilder {
  return {
    prompt: `

Answer the question using the transcript and past conversation context.
If the answer cannot be determined from the provided context, respond with the answer "Not enough information."
Output ONLY valid JSON.

Transcript:
${transcript}

Question:
"${question}"
Past conversation: ${passQA ? JSON.stringify(passQA) : 'None'}

Return ONLY valid JSON:
{
  "question": "${question}",
  "answer": "",
  "confidence_score": 0.0
}
`,
  }
}
