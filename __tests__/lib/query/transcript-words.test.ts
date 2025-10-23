import { saveTranscriptWords } from '@/lib/query/transcription-operations'
import { supabase } from '@/lib/supabase'
import { TranscriptionWord } from '@/types/transcription'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

describe('Transcript Words Query Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('saveTranscriptWords', () => {
    it('should save multiple transcript words with proper field mapping', async () => {
      const mockTranscriptId = 'transcript-1'
      const mockWords: TranscriptionWord[] = [
        { text: 'Hello', confidence: 0.98, start: 0, end: 0.5, word_is_final: true },
        { text: 'world', confidence: 0.97, start: 0.5, end: 1.0, word_is_final: true },
      ]

      const expectedRows = [
        {
          transcript_id: mockTranscriptId,
          text: 'Hello',
          confidence: 0.98,
          start_time: 0,
          end_time: 0.5,
          word_is_final: true,
        },
        {
          transcript_id: mockTranscriptId,
          text: 'world',
          confidence: 0.97,
          start_time: 0.5,
          end_time: 1.0,
          word_is_final: true,
        },
      ]

      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockResolvedValue({
        data: [
          { id: 'word-1', ...expectedRows[0] },
          { id: 'word-2', ...expectedRows[1] },
        ],
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      mockInsert.mockReturnValue({
        select: mockSelect,
      })

      const result = await saveTranscriptWords(mockTranscriptId, mockWords)

      expect(supabase.from).toHaveBeenCalledWith('transcription_words')
      expect(mockInsert).toHaveBeenCalledWith(expectedRows)
      expect(result).toHaveLength(2)
      expect(result[0].text).toBe('Hello')
      expect(result[1].text).toBe('world')
    })

    it('should return empty array if no data returned', async () => {
      const mockWords: TranscriptionWord[] = [
        { text: 'Hello', confidence: 0.98, start: 0, end: 0.5, word_is_final: true },
      ]

      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      mockInsert.mockReturnValue({
        select: mockSelect,
      })

      const result = await saveTranscriptWords('transcript-1', mockWords)

      expect(result).toEqual([])
    })

    it('should throw error if database insert fails', async () => {
      const mockError = { message: 'Database error' }
      const mockWords: TranscriptionWord[] = [
        { text: 'Hello', confidence: 0.98, start: 0, end: 0.5, word_is_final: true },
      ]

      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      mockInsert.mockReturnValue({
        select: mockSelect,
      })

      await expect(saveTranscriptWords('transcript-1', mockWords)).rejects.toThrow(
        'Error when saving transcript words: Database error'
      )
    })

    it('should handle empty words array', async () => {
      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      mockInsert.mockReturnValue({
        select: mockSelect,
      })

      const result = await saveTranscriptWords('transcript-1', [])

      expect(mockInsert).toHaveBeenCalledWith([])
      expect(result).toEqual([])
    })

    it('should correctly map field names from camelCase to snake_case', async () => {
      const mockWord: TranscriptionWord = {
        text: 'Test',
        confidence: 0.95,
        start: 1.0,
        end: 1.5,
        word_is_final: false,
      }

      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockResolvedValue({
        data: [{ id: 'word-1' }],
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      })

      mockInsert.mockReturnValue({
        select: mockSelect,
      })

      await saveTranscriptWords('transcript-1', [mockWord])

      expect(mockInsert).toHaveBeenCalledWith([
        {
          transcript_id: 'transcript-1',
          text: 'Test',
          confidence: 0.95,
          start_time: 1.0,
          end_time: 1.5,
          word_is_final: false,
        },
      ])
    })
  })
})
