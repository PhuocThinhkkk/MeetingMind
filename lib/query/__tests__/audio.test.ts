import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAudioHistory, saveAudioFile } from '../audio'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}))

vi.mock('@/lib/utils', () => ({
  getAudioDuration: vi.fn(() => Promise.resolve(120)),
}))

describe('getAudioHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch and format audio history successfully', async () => {
    const mockData = [
      {
        id: '1',
        user_id: 'user-123',
        name: 'audio1.wav',
        url: 'https://example.com/audio1.wav',
        duration: 120,
        file_size: 1024000,
        mime_type: 'audio/wav',
        transcription_status: 'done',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        transcript: [{ id: 't1', audio_id: '1', text: 'Hello', created_at: '2024-01-01T00:00:00Z' }],
      },
    ]

    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    }

    vi.mocked(supabase.from).mockReturnValue(mockFrom as any)

    const result = await getAudioHistory('user-123')

    expect(supabase.from).toHaveBeenCalledWith('audio_files')
    expect(mockFrom.select).toHaveBeenCalledWith('*, transcript:transcripts(*)')
    expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123')
    expect(mockFrom.order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(result).toHaveLength(1)
    expect(result[0].transcript).toEqual(mockData[0].transcript[0])
  })

  it('should return empty array on error', async () => {
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
    }

    vi.mocked(supabase.from).mockReturnValue(mockFrom as any)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await getAudioHistory('user-123')

    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching audio history:', { message: 'Database error' })
  })

  it('should handle empty data', async () => {
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }

    vi.mocked(supabase.from).mockReturnValue(mockFrom as any)
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await getAudioHistory('user-123')

    expect(result).toEqual([])
    expect(consoleWarnSpy).toHaveBeenCalledWith('no audio found! Data: ', [])
  })

  it('should normalize transcript to null when not present', async () => {
    const mockData = [
      {
        id: '1',
        user_id: 'user-123',
        name: 'audio1.wav',
        url: 'https://example.com/audio1.wav',
        duration: 120,
        file_size: 1024000,
        mime_type: 'audio/wav',
        transcription_status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        transcript: [],
      },
    ]

    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    }

    vi.mocked(supabase.from).mockReturnValue(mockFrom as any)

    const result = await getAudioHistory('user-123')

    expect(result[0].transcript).toBeNull()
  })
})

describe('saveAudioFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should upload blob and save audio file record', async () => {
    const mockBlob = new Blob(['mock audio'], { type: 'audio/wav' })
    const mockUserId = 'user-123'
    const mockName = 'test-audio'

    const mockStorage = {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/audio.wav' },
        }),
      }),
    }

    const mockFrom = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'audio-123',
          user_id: mockUserId,
          name: mockName,
          url: 'https://example.com/audio.wav',
          duration: 120,
          file_size: mockBlob.size,
          mime_type: 'audio/wav',
          transcription_status: 'done',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      }),
    }

    vi.mocked(supabase.storage).from = mockStorage.from
    vi.mocked(supabase.from).mockReturnValue(mockFrom as any)

    const result = await saveAudioFile(mockBlob, mockUserId, mockName)

    expect(result.id).toBe('audio-123')
    expect(result.name).toBe(mockName)
    expect(result.user_id).toBe(mockUserId)
  })

  it('should throw error on upload failure', async () => {
    const mockBlob = new Blob(['mock audio'], { type: 'audio/wav' })
    const uploadError = { message: 'Upload failed' }

    const mockStorage = {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: uploadError }),
      }),
    }

    vi.mocked(supabase.storage).from = mockStorage.from
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(saveAudioFile(mockBlob, 'user-123', 'test')).rejects.toEqual(uploadError)
    expect(consoleSpy).toHaveBeenCalledWith('Upload error:', uploadError)
  })

  it('should throw error on database insert failure', async () => {
    const mockBlob = new Blob(['mock audio'], { type: 'audio/wav' })
    const dbError = { message: 'Database error' }

    const mockStorage = {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/audio.wav' },
        }),
      }),
    }

    const mockFrom = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: dbError }),
    }

    vi.mocked(supabase.storage).from = mockStorage.from
    vi.mocked(supabase.from).mockReturnValue(mockFrom as any)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(saveAudioFile(mockBlob, 'user-123', 'test')).rejects.toEqual(dbError)
    expect(consoleSpy).toHaveBeenCalledWith('DB insert error:', dbError)
  })

  it('should handle getAudioDuration error gracefully', async () => {
    const mockBlob = new Blob(['mock audio'], { type: 'audio/wav' })

    const { getAudioDuration } = await import('@/lib/utils')
    vi.mocked(getAudioDuration).mockRejectedValue(new Error('Audio duration error'))

    const mockStorage = {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/audio.wav' },
        }),
      }),
    }

    const mockFrom = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'audio-123',
          duration: 0,
        },
        error: null,
      }),
    }

    vi.mocked(supabase.storage).from = mockStorage.from
    vi.mocked(supabase.from).mockReturnValue(mockFrom as any)

    const result = await saveAudioFile(mockBlob, 'user-123', 'test')

    expect(result.duration).toBe(0)
  })
})