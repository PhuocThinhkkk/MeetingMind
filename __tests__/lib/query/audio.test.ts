import { getAudioHistory, saveAudioFile, updateAudioName, deleteAudioById } from '@/lib/query/audio'
import { supabase } from '@/lib/supabase'
import { getAudioDuration } from '@/lib/utils'
import { AudioFile } from '@/types/transcription'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn(),
    },
  },
}))

jest.mock('@/lib/utils', () => ({
  getAudioDuration: jest.fn(),
}))

describe('Audio Query Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAudioHistory', () => {
    it('should return formatted audio history with transcripts and words', async () => {
      const mockData = [
        {
          id: 'audio-1',
          user_id: 'user-1',
          name: 'Meeting 1',
          url: 'https://example.com/audio1.wav',
          duration: 120,
          file_size: 1024000,
          mime_type: 'audio/wav',
          transcription_status: 'done',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          transcript: [
            {
              id: 'transcript-1',
              audio_id: 'audio-1',
              text: 'Hello world',
              created_at: '2025-01-01T00:00:00Z',
              words: [
                {
                  id: 'word-1',
                  text: 'Hello',
                  start_time: 0,
                  end_time: 0.5,
                  confidence: 0.98,
                },
              ],
            },
          ],
        },
      ]

      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        eq: mockEq,
      })

      mockEq.mockReturnValue({
        order: mockOrder,
      })

      const result = await getAudioHistory('user-1')

      expect(supabase.from).toHaveBeenCalledWith('audio_files')
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toHaveLength(1)
      expect(result[0].transcript).toBeDefined()
      expect(result[0].transcript?.words).toHaveLength(1)
    })

    it('should return empty array when no data found', async () => {
      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        eq: mockEq,
      })

      mockEq.mockReturnValue({
        order: mockOrder,
      })

      const result = await getAudioHistory('user-1')

      expect(result).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      const mockError = { message: 'Database error' }
      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockResolvedValue({ data: null, error: mockError })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        eq: mockEq,
      })

      mockEq.mockReturnValue({
        order: mockOrder,
      })

      const result = await getAudioHistory('user-1')

      expect(result).toEqual([])
    })

    it('should handle transcripts without words', async () => {
      const mockData = [
        {
          id: 'audio-1',
          user_id: 'user-1',
          name: 'Meeting 1',
          transcript: [
            {
              id: 'transcript-1',
              audio_id: 'audio-1',
              text: 'Hello world',
              created_at: '2025-01-01T00:00:00Z',
              // words is missing
            },
          ],
        },
      ]

      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockOrder = jest.fn().mockResolvedValue({ data: mockData, error: null })

      ;(supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        eq: mockEq,
      })

      mockEq.mockReturnValue({
        order: mockOrder,
      })

      const result = await getAudioHistory('user-1')

      expect(result[0].transcript?.words).toEqual([])
    })
  })

  describe('saveAudioFile', () => {
    it('should upload blob and save audio metadata to database', async () => {
      const mockBlob = new Blob(['test audio'], { type: 'audio/wav' })
      const mockUserId = 'user-1'
      const mockName = 'Test Recording'
      const mockDuration = 120

      // Mock storage upload
      const mockUpload = jest.fn().mockResolvedValue({ error: null })
      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/audio.wav' },
      })

      ;(supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })

      // Mock getAudioDuration
      ;(getAudioDuration as jest.Mock).mockResolvedValue(mockDuration)

      // Mock database insert
      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: 'audio-1',
          user_id: mockUserId,
          name: mockName,
          url: 'https://example.com/audio.wav',
          duration: mockDuration,
          file_size: mockBlob.size,
          mime_type: mockBlob.type,
          transcription_status: 'done',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
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

      const result = await saveAudioFile(mockBlob, mockUserId, mockName)

      expect(supabase.storage.from).toHaveBeenCalledWith('audio-files')
      expect(mockUpload).toHaveBeenCalled()
      expect(getAudioDuration).toHaveBeenCalledWith(mockBlob)
      expect(supabase.from).toHaveBeenCalledWith('audio_files')
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUserId,
        name: mockName,
        url: 'https://example.com/audio.wav',
        duration: Math.round(mockDuration),
        file_size: mockBlob.size,
        mime_type: mockBlob.type,
        transcription_status: 'done',
      })
      expect(result.id).toBe('audio-1')
    })

    it('should throw error if upload fails', async () => {
      const mockBlob = new Blob(['test audio'], { type: 'audio/wav' })
      const uploadError = new Error('Upload failed')

      const mockUpload = jest.fn().mockResolvedValue({ error: uploadError })

      ;(supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
      })

      await expect(saveAudioFile(mockBlob, 'user-1', 'Test')).rejects.toThrow(uploadError)
    })

    it('should handle duration calculation failure gracefully', async () => {
      const mockBlob = new Blob(['test audio'], { type: 'audio/wav' })

      const mockUpload = jest.fn().mockResolvedValue({ error: null })
      const mockGetPublicUrl = jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/audio.wav' },
      })

      ;(supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })

      ;(getAudioDuration as jest.Mock).mockRejectedValue(new Error('Duration calc failed'))

      const mockInsert = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: 'audio-1', duration: 0 },
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

      const result = await saveAudioFile(mockBlob, 'user-1', 'Test')

      expect(result.duration).toBe(0)
    })
  })

  describe('updateAudioName', () => {
    it('should update audio name and timestamp', async () => {
      const mockAudioId = 'audio-1'
      const mockNewName = 'Updated Name'

      const mockUpdate = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: mockAudioId,
          name: mockNewName,
          updated_at: expect.any(String),
        },
        error: null,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      })

      mockUpdate.mockReturnValue({
        eq: mockEq,
      })

      mockEq.mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      const result = await updateAudioName(mockAudioId, mockNewName)

      expect(supabase.from).toHaveBeenCalledWith('audio_files')
      expect(mockUpdate).toHaveBeenCalledWith({
        name: mockNewName,
        updated_at: expect.any(String),
      })
      expect(mockEq).toHaveBeenCalledWith('id', mockAudioId)
      expect(result.name).toBe(mockNewName)
    })

    it('should throw error if update fails', async () => {
      const mockError = new Error('Update failed')

      const mockUpdate = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSelect = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      })

      ;(supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      })

      mockUpdate.mockReturnValue({
        eq: mockEq,
      })

      mockEq.mockReturnValue({
        select: mockSelect,
      })

      mockSelect.mockReturnValue({
        single: mockSingle,
      })

      await expect(updateAudioName('audio-1', 'New Name')).rejects.toThrow(mockError)
    })
  })

  describe('deleteAudioById', () => {
    it('should delete audio record by ID', async () => {
      const mockAudioId = 'audio-1'

      const mockDelete = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockResolvedValue({ error: null })

      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      mockDelete.mockReturnValue({
        eq: mockEq,
      })

      const result = await deleteAudioById(mockAudioId)

      expect(supabase.from).toHaveBeenCalledWith('audio_files')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', mockAudioId)
      expect(result).toBe(true)
    })

    it('should throw error if delete fails', async () => {
      const mockError = new Error('Delete failed')

      const mockDelete = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockResolvedValue({ error: mockError })

      ;(supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
      })

      mockDelete.mockReturnValue({
        eq: mockEq,
      })

      await expect(deleteAudioById('audio-1')).rejects.toThrow(mockError)
    })
  })
})
