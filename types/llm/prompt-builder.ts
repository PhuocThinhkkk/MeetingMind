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
  question: string
): PromptBuilder {
  return {
    prompt: `

Answer the question using ONLY the transcript.
If unsure, say "Not enough information".

Transcript:
${transcript}

Question:
"${question}"

Return ONLY valid JSON:
{
  "question": "${question}",
  "answer": "",
  "confidence_score": 0.0
}
`,
  }
}
