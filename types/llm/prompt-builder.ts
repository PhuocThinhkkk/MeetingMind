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

Answer the question using the transcript, question and pass conversation.
Understand the transcript also the context of the current conversation and then answer with correct format

Transcript:
${transcript}

Question:
"${question}"

Pass conversation:"${JSON.stringify(passQA)}"

Return ONLY valid JSON:
{
  "question": "${question}",
  "answer": "",
  "confidence_score": 0.0
}
`,
  }
}
