# Architecture

MeetingMind consists of:
- **Nextjs:** Next.js (App Router) for UI and api routes
- **Socket Server:** Go WebSocket server just for real-time transcription
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase buckets for audio files




## 📁 Project Structure

```
MeetingMind/
├── app/                      # Next.js app router pages
│   ├── (main)/              # Main app layout
│   │   ├── history/         # Audio history pages
│   │   └── home/            # Home/recording page
│   └── auth/                # Authentication pages
├── components/              # React components
│   ├── context/             # React context providers
│   ├── dashboard/           # Dashboard components
│   └── ui/                  # UI components (shadcn/ui)
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and queries
│   ├── query/               # Database query functions
│   └── utils.ts             # Helper utilities
├── socket-server/           # Go WebSocket server
├── supabase/               # Supabase migrations
└── types/                   # TypeScript type definitions
```

## 🏗️ Component Interaction

1. **Next.js App:**
   - Handles user interface, authentication, and API routes.
   - Connects to the Supabase database for storing user data and audio files.
   - Communicates with the Go WebSocket server for real-time transcription.

2. **Go WebSocket Server:**
   - Manages WebSocket connections for real-time audio streaming.
   - Interfaces with AssemblyAI for transcription services.
   - Sends transcribed text back to the Next.js app via WebSocket.


