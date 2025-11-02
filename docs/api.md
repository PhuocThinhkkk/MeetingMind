
# API Reference

This document describes the APIs and interfaces available in MeetingMind.

## Table of Contents
- [WebSocket API](#websocket-api)
- [Database API](#database-api)
- [Audio Operations](#audio-operations)
- [Transcription Operations](#transcription-operations)
- [Type Definitions](#type-definitions)

## WebSocket API

### Connection

**Endpoint:** `ws://localhost:9090/ws` (development)

**Protocol:** WebSocket

**Description:** Establishes a persistent connection for real-time audio streaming and transcription.

### Client → Server Messages

#### Audio Chunk (Binary)
```
Type: Binary Message
Format: int16 PCM audio data
Sample Rate: 16kHz
Channels: Mono
Chunk Size: 1800 bytes (900 samples, ~56.25ms)
```

**Example** (from browser):
```typescript
websocket.send(audioBuffer); // ArrayBuffer of int16 PCM data
```

### Server → Client Messages

#### Transcript Response (JSON)
```typescript
{
  "type": "transcript",
  "isEndOfTurn": boolean,
  "words": [
    {
      "text": string,
      "start": number,      // milliseconds
      "end": number,        // milliseconds
      "confidence": number, // 0-1
      "word_is_final": boolean
    }
  ]
}
```

**Example Response:**
```json
{
  "type": "transcript",
  "isEndOfTurn": false,
  "words": [
    {
      "text": "Hello",
      "start": 0,
      "end": 400,
      "confidence": 0.95,
      "word_is_final": true
    },
    {
      "text": "world",
      "start": 400,
      "end": 800,
      "confidence": 0.92,
      "word_is_final": false
    }
  ]
}
```

#### Begin Message
```typescript
{
  "type": "begin"
}
```
Sent when the transcription session starts.

#### Translation Response (JSON)
```typescript
{
  "type": "translate",
  "language": string,
  "text": string
}
```


## Rate Limiting

- WebSocket connections are not rate-limited by the server (will implement)
- AssemblyAI has its own rate limits based on your plan
- Database operations follow Supabase rate limits

## Authentication

All database operations on client require authentication through Supabase Auth.

**Example:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  const history = await getAudioHistory(user.id);
}
```


## Error Responses


### Database Errors
Supabase errors follow this structure:
```typescript
{
  error: {
    message: string;
    code: string;
    details: string;
  }
}
```

## Related Documentation

- [Real-time Transcription](./real-time-transcription.md)
- [WebSocket Backend](./socket-server.md)
- [Database & Supabase](./database.md)

