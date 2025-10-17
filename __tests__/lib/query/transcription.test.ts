import { saveTranscript } from '@/lib/query/transcription'
import { supabase } from '@/lib/supabase'
import { TranscriptionWord } from '@/types/transcription'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('Transcription Query Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('saveTranscript', () => {
    it('should save transcript with concatenated text from words', async () => {
      const mockAudioId = 'audio-1'
      const mockTranscriptWords: TranscriptionWord[] = [
        { text: 'Hello', confidence: 0.98, start: 0, end: 0.5, word_is_final: true },
        { text: 'world', confidence: 0.97, start: 0.5, end: 1.0, word_is_final: true },
        { text: 'test', confidence: 0.99, start: 1.0, end: 1.5, word_is_final: true },
      ]

      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: 'transcript-1',
          audio_id: mockAudioId,
          text: 'Hello world test',
          created_at: '2025-01-01T00:00:00Z',
        },
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      mockInsert.mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const result = await saveTranscript(mockAudioId, mockTranscriptWords)

      expect(supabase.from).toHaveBeenCalledWith('transcripts')
      expect(mockInsert).toHaveBeenCalledWith({
        audio_id: mockAudioId,
        text: 'Hello world test',
      })
      expect(result.text).toBe('Hello world test')
      expect(result.audio_id).toBe(mockAudioId)
    })

    it('should throw error if transcripts array is empty', async () => {
      await expect(saveTranscript('audio-1', [])).rejects.toThrow('Transcripts array cannot be empty')
    })

    it('should throw error if transcripts is null/undefined', async () => {
      await expect(saveTranscript('audio-1', null as any)).rejects.toThrow('Transcripts array cannot be empty')
    })

    it('should throw error if database insert fails', async () => {
      const mockError = new Error('Database error')
      const mockTranscriptWords: TranscriptionWord[] = [
        { text: 'Hello', confidence: 0.98, start: 0, end: 0.5, word_is_final: true },
      ]

      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      mockInsert.mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      await expect(saveTranscript('audio-1', mockTranscriptWords)).rejects.toThrow(mockError)
    })

    it('should handle single word transcript', async () => {
      const mockTranscriptWords: TranscriptionWord[] = [
        { text: 'Hello', confidence: 0.98, start: 0, end: 0.5, word_is_final: true },
      ]

      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: 'transcript-1',
          audio_id: 'audio-1',
          text: 'Hello',
          created_at: '2025-01-01T00:00:00Z',
        },
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      mockInsert.mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const result = await saveTranscript('audio-1', mockTranscriptWords)

      expect(result.text).toBe('Hello')
    })
  })
})
