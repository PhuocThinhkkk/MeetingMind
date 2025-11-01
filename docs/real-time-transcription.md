# Real-Time Transcription Pipeline

## Overview
MeetingMind supports **real-time audio transcription** via a WebSocket pipeline between:
- **Next.js client** (records audio in browser)
- **Go WebSocket server** (handles streaming, transcription, and partial updates)
- **Supabase** (stores final transcripts)

This document explains the data flow, message formats, buffering strategy, and integration points.

---
 ## 1. Important knowledge about AssemblyAI Streaming API
 [AssemblyAI Streaming Getting Start Documentation](https://www.assemblyai.com/docs/getting-started/transcribe-streaming-audio)\
 [AssemblyAI Streaming API Documentation](https://www.assemblyai.com/docs/api-reference/streaming-api/streaming-api)

- AssemblyAI Streaming API requires audio data to be sent in **16kHz mono PCM format**.
- Each audio chunk sent to AssemblyAI should ideally be around **50ms to 100ms** in duration.
- The API supports sending audio data in real-time, allowing for low-latency transcription.
- AssemblyAI provides **partial transcription results** during the streaming session, which can be used to display real-time captions.
- The WebSocket connection should be kept alive for the duration of the transcription session, and proper error handling should be implemented to manage disconnections or timeouts.

In this application, we send 1800 bytes of chunks, int16 PCM format, AssemblyAI every time.
We will format it all on the client side and then send it to our Go WebSocket server, which will forward it to AssemblyAI.\
Why 1800 bytes?
- 16kHz mono PCM means 16,000 samples per second.
- Each sample is 2 bytes (16 bits).
- 1800 bytes / 2 bytes per sample = 900 samples.
- 900 samples / 16,000 samples per second = 0.05625 seconds
- so it was around 56.25ms, which is within the recommended range of 50ms to 100ms for sending audio chunks to AssemblyAI.


---

## 2. Sending audio chunks on the Client Side
[components/context/real-time-transcription.ts](./components/context/real-time-transcription.ts)

1. The browser records audio chunks via `AudioWorklet`.
2. When we call `startTranscription()`, it gonna start connecting to the Websocket server, the server then send us a begin msg if it was good
3. request microphone and system audio access.
4. After that, when recording the audio, audio will be processed from 2 channels to 1 channel (mono) in the [public/worklet-processor.js](./public/worklet-processor.js) file.
5. The `handleWorkletSendingMessage` function will format the audio chunks into int16 PCM and send the chunks if it was greater than 1800 bytes.
- first checking if the websocket server was good and the AssemblyAI ( The ws server will send us an begin msg on the `handleWorkletReceivingMessage` and then we can update the state to know if it was ready )
-  use `resampleTo16kHz` function and `float32ToInt16` function to format the audio chunks.
-  convert it to Uint8Array (for beter binary transmission over WebSocket).
````
const chunk = new Uint8Array(int16Array.buffer)
// pcmData = Int16Array [32768, 100, 2500]
// chunk = Uint8Array of raw bytes [0,128,100,0,196,9,...]
````
-  collect the chunks until it reaches 1800 bytes.
-  merge all the arrays chunks into one Uint8Array and send it to the Go WebSocket server.
````
// before 
currentAudioBufferRef.current = [
    [1, 2, 3, ..., 600],
    [101, 102, 103, ..., 700],
    [201, 202, 203, ..., 800],
]
totalByteLengthRef.current = 1800
// after 
merged = [
  1, 2, 3, ..., 600,        // chunk1
  101, 102, ..., 700,       // chunk2
  201, 202, ..., 800        // chunk3
]
````
---
## 3. Go server for handling sending audio to AssemblyAI


---
## 4. Receiving data from Go ws server

[types/transcription.ws.ts](./types/transcription.ws.ts)
````ts
export interface RealtimeBeginMsg {
  type: "ready";
}

export interface RealtimeTranslateResponse {
  type: "translate";
  words: string;
}

export interface RealtimeTranscriptResponse{
  type: "transcript";
  isEndOfTurn: boolean;
  words: RealtimeTranscriptionWord[];
}

export type RealtimeTranscriptionWord= {
  text: string;
  confidence: number;
  start: number;
  end: number;
  word_is_final: boolean;
}
````
in `RealtimeTranscriptResponse` : `isEndOfTurn = true` if the current sentence is fully done
in `RealtimeTranscriptionWord`:
- `word_is_final=true` if the word is fully transcript
- `start` is the start time of that word (ms)
- `end` is the end time of that word (ms)

The WS server also cut some words that we dont need, it just send the new word or a word that have new state (update `word_is_final=true`)\
Example AssemblyAI will give you this:\
First msg:
````json
{
  "turn_order": 0,
  "turn_is_formatted": false,
  "end_of_turn": false,
  "transcript": "hi my",
  "end_of_turn_confidence": 0.001037,
  "words": [
    {
      "start": 1920,
      "end": 2000,
      "text": "hi",
      "confidence": 0.874618,
      "word_is_final": true
    },
    {
      "start": 2960,
      "end": 3040,
      "text": "name",
      "confidence": 0.999999,
      "word_is_final": false,  // this word isn't done yet
    }
  ],
  "utterance": "",
  "type": "Turn"
}

````
Second msg:
````json
{
  "turn_order": 0,
  "turn_is_formatted": false,
  "end_of_turn": false,
  "transcript": "hi my",
  "end_of_turn_confidence": 0.001037,
  "words": [
    {
      "start": 1920,
      "end": 2000,
      "text": "hi",
      "confidence": 0.874618,
      "word_is_final": true
    },
    {
      "start": 2960,
      "end": 3040,
      "text": "name",
      "confidence": 0.999999,
      "word_is_final": true,  //changed here
    }
  ],
  "utterance": "",
  "type": "Turn"
}

````
Instead of sending all the words in the current sentence over and over again like the word "hi"\
WS server will do like this:\

First msg:
````json
{
  "type": "transcript",
  "isEndOfTurn": false,
  "words": [
    {
      "start": 1920,
      "end": 2000,
      "text": "hi",
      "confidence": 0.874618,
      "word_is_final": true
    },
    {
      "start": 2960,
      "end": 3040,
      "text": "name",
      "confidence": 0.999999,
      "word_is_final": false,  // this word isn't done yet
    }
  ],
}

````
Second msg:

````json
{
  "type": "transcript",
  "isEndOfTurn": false,
  "words": [
    {
      "start": 2960,
      "end": 3040,
      "text": "name",
      "confidence": 0.999999,
      "word_is_final": true,  // just send back to client the new word or the state that have been changed
    }
  ],
}

````



