
# Next.js Application

This document covers the structure and organization of the MeetingMind Next.js frontend application.

## Overview

MeetingMind uses Next.js 14+ with the App Router, TypeScript, and Tailwind CSS for styling. The application provides real-time audio transcription capabilities with a modern, responsive UI.

## Directory Structure

```
app/
├── (main)/                    # Authenticated routes group
│   ├── home/                  # Home/transcription page
│   ├── history/               # Transcript history
│   └── layout.tsx             # Shared layout for main routes
├── auth/                      # Authentication routes
│   ├── login/
│   └── signup/
├── layout.tsx                 # Root layout
├── page.tsx                   # Landing page
└── globals.css                # Global styles

components/
├── context/                   # React context providers
│   ├── realtime-recorder-context.tsx
│   └── audios-list-context.tsx
├── dashboard/                 # Dashboard components
├── ui/                        # Reusable UI components
└── side-bar-header.tsx

hooks/
├── use-auth.tsx              # Authentication hook
├── use-mobile.ts             # Mobile detection
└── use-toast.ts              # Toast notifications

lib/
├── supabase.ts               # Supabase client
├── query/                    # Database operations
│   ├── audio-operations.ts
│   └── transcription-operations.ts
├── audioWorkletUtils.ts      # Audio processing
├── transcriptionUtils.ts     # Transcription helpers
├── logger.ts                 # Logging utility
└── utils.ts                  # General utilities

public/
└── worklet-processor.js      # Audio worklet for processing
```

## Key Pages

### Landing Page (`app/page.tsx`)

### Home Page (`app/(main)/home/page.tsx`)
- Real-time transcription interface
- Wrapped in `RealtimeRecorderProvider` for WebSocket audio streaming
- Client-side only with dynamic loading

### History Page (`app/(main)/history/page.tsx`)
- Displays past transcription records
- Wrapped in `AudioProvider` context
- Fetches data from Supabase

## Context Providers

### RealtimeRecorderProvider
Located in `components/context/realtime-recorder-context.tsx`
- Manages WebSocket connection to the socket server
- Handles audio recording and streaming
- Provides real-time transcription state
- Uses `RealtimeTranscriptResponse` type

### AudioProvider
Located in `components/context/audios-list-context.tsx`
- Manages audio file list and operations
- Provides CRUD operations for audio records
- Integrates with Supabase database

## Custom Hooks

### `use-auth`
Provides authentication state and user information:
```typescript
const { user, loading } = useAuth();
```

### `use-mobile`
Detects mobile device for responsive behavior:
```typescript
const isMobile = useMobile();
```

### `use-toast`
Displays toast notifications:
```typescript
const { toast } = useToast();
toast({ title: "Success", description: "Action completed" });
```

## Data Fetching

### Database Operations on the Client Side (using supabase client)
Query operations are organized in `lib/query/`:

- **Audio Operations** (`audio-operations.ts`):
  - `getAudioHistory(userId)` - Fetch user's audio files with transcripts

- **Transcription Operations** (`transcription-operations.ts`):
  - Operations for managing transcripts and words

### Supabase Integration
The Supabase client is configured in `lib/supabase.ts`:
```typescript
import { supabase } from '@/lib/supabase';
```

## Audio Processing

Audio processing is handled through:
- **Audio Worklet** (`public/worklet-processor.js`) - Processes raw audio in a separate thread
- **Audio Utils** (`lib/audioWorkletUtils.ts`) - Helper functions for audio operations
- **Transcription Utils** (`lib/transcriptionUtils.ts`) - Duration calculation and formatting

## Environment Variables

Required environment variables for the Next.js app:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_WS_SERVER_URL=ws://localhost:9090
```
