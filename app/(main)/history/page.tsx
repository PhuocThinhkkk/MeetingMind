import { AudioHistoryList } from "@/components/audio-history-list";
import { HistoryToolbar } from "@/components/history-toolbar";
import { TranscriptModal } from "@/components/transcript-modal";

async function getAudioHistory() {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Team Meeting Recording.mp3",
      url: "https://example.com/audio/team-meeting.mp3",
      duration: 3600, // 1 hour in seconds
      file_size: 52428800, // 50MB in bytes
      mime_type: "audio/mpeg",
      transcription_status: "completed",
      created_at: "2025-01-15T10:30:00Z",
      updated_at: "2025-01-15T10:45:00Z",
      transcript: {
        id: "660e8400-e29b-41d4-a716-446655440001",
        audio_id: "550e8400-e29b-41d4-a716-446655440001",
        text: "Welcome everyone to today's team meeting. Let's start by reviewing our quarterly goals and discussing the progress we've made so far. First, I'd like to hear from the development team about the new features they've been working on...",
        language: "en-US",
        confidence_score: 0.95,
        speakers_detected: 4,
        created_at: "2025-01-15T10:45:00Z",
      },
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Client Interview.wav",
      url: "https://example.com/audio/client-interview.wav",
      duration: 2400, // 40 minutes
      file_size: 120000000, // 114MB
      mime_type: "audio/wav",
      transcription_status: "processing",
      created_at: "2025-01-16T14:20:00Z",
      updated_at: "2025-01-16T14:25:00Z",
      transcript: null,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Podcast Episode 42.mp3",
      url: "https://example.com/audio/podcast-42.mp3",
      duration: 5400, // 1.5 hours
      file_size: 72000000, // 68MB
      mime_type: "audio/mpeg",
      transcription_status: "completed",
      created_at: "2025-01-10T09:00:00Z",
      updated_at: "2025-01-10T09:30:00Z",
      transcript: {
        id: "660e8400-e29b-41d4-a716-446655440002",
        audio_id: "550e8400-e29b-41d4-a716-446655440003",
        text: "Hello and welcome to episode 42 of our podcast. Today we're diving deep into the world of artificial intelligence and machine learning. Our special guest is Dr. Sarah Johnson, who has been researching neural networks for over a decade...",
        language: "en-US",
        confidence_score: 0.92,
        speakers_detected: 2,
        created_at: "2025-01-10T09:30:00Z",
      },
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Voice Note.m4a",
      url: "https://example.com/audio/voice-note.m4a",
      duration: 180, // 3 minutes
      file_size: 2800000, // 2.7MB
      mime_type: "audio/mp4",
      transcription_status: "failed",
      created_at: "2025-01-17T16:45:00Z",
      updated_at: "2025-01-17T16:46:00Z",
      transcript: null,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440005",
      user_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Morning Standup.mp3",
      url: "https://example.com/audio/standup.mp3",
      duration: 900, // 15 minutes
      file_size: 15000000, // 14.3MB
      mime_type: "audio/mpeg",
      transcription_status: "completed",
      created_at: "2025-01-17T09:15:00Z",
      updated_at: "2025-01-17T09:20:00Z",
      transcript: {
        id: "660e8400-e29b-41d4-a716-446655440003",
        audio_id: "550e8400-e29b-41d4-a716-446655440005",
        text: "Good morning team. Let's do a quick standup. Sarah, what did you work on yesterday?",
        language: "en-US",
        confidence_score: 0.88,
        speakers_detected: 5,
        created_at: "2025-01-17T09:20:00Z",
      },
    },
  ];
}

export default async function TranscriptHistoryPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const { id } = await searchParams;
  const audioHistory = await getAudioHistory();
  const selectedAudio = id
    ? audioHistory.find((audio) => audio.id === id)
    : null;

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="container mx-aut px-4 py-6 max-w-6xl">
        <div className="mb-6 border-b pb-3">
          <h1 className="text-xl font-semibold text-foreground">History Recording</h1>
        </div>

        <HistoryToolbar />

        <AudioHistoryList audioHistory={audioHistory} />

        {selectedAudio && <TranscriptModal audio={selectedAudio} />}
      </div>
    </main>
  );
}
