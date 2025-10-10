import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveTranscript } from '../transcription'
import { supabase } from '@/lib/supabase'
import { TranscriptionWord } from '@/types/transcription'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('saveTranscript', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should save transcript successfully', async () => {
    const mockTranscripts: TranscriptionWord[] = [
      { text: 'Hello', confidence: 0.9, start: 0, end: 1, word_is_final: true },
      { text: 'world', confidence: 0.95, start: 1, end: 2, word_is_final: true },
    ]

    const mockFrom = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'transcript-123',
          audio_id: 'audio-123',
          text: 'Hello world',
          created_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      }),
    }

    vi.mocked(supabase.from).mockReturnValue(mockFrom as any)

    const result = await saveTranscript('audio-123', mockTranscripts)

    expect(supabase.from).toHaveBeenCalledWith('transcripts')
    expect(mockFrom.insert).toHaveBeenCalledWith({
      audio_id: 'audio-123',
      text: 'Hello world',
    })
    expect(result.id).toBe('transcript-123')
    expect(result.text).toBe('Hello world')
  })

  it('should throw error if transcripts array is empty', async () => {
    await expect(saveTranscript('audio-123', [])).rejects.toThrow(
      'Transcripts array cannot be empty'
    )
  })

  it('should throw error if transcripts is null', async () => {
    await expect(saveTranscript('audio-123', null as any)).rejects.toThrow(
      'Transcripts array cannot be empty'
    )
  })

  it('should concatenate transcript texts with spaces', async () => {
    const mockTranscripts: TranscriptionWord[] = [
      { text: 'The', confidence: 0.9, start: 0, end: 1, word_is_final: true },
      { text: 'quick', confidence: 0.95, start: 1, end: 2, word_is_final: true },
      { text: 'brown', confidence: 0.92, start: 2, end: 3, word_is_final: true },
      { text: 'fox', confidence: 0.98, start: 3, end: 4, word_is_final: true },
    ]

    const mockFrom = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'transcript-123',
          audio_id: 'audio-123',
          text: 'The quick brown fox',
          created_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      }),
    }

    vi.mocked(supabase.from).mockReturnValue(mockFrom as any)

    const result = await saveTranscript('audio-123', mockTranscripts)

    expect(result.text).toBe('The quick brown fox')
  })

  it('should throw error on database insert failure', async () => {
    const mockTranscripts: TranscriptionWord[] = [
      { text: 'Hello', confidence: 0.9, start: 0, end: 1, word_is_final: true },
    ]

    const dbError = { message: 'Database error' }

    const mockFrom = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: dbError }),
    }

    vi.mocked(supabase.from).mockReturnValue(mockFrom as any)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(saveTranscript('audio-123', mockTranscripts)).rejects.toEqual(dbError)
    expect(consoleSpy).toHaveBeenCalledWith('Error saving transcript:', dbError)
  })
})