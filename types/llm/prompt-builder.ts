import { QALog } from '../utils'

export type PromptBuilder = {
  prompt: string
}

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
