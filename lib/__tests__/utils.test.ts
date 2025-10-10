import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cn,
  convertFloat32ToInt16,
  waitFor,
  formatDuration,
  formatFileSize,
  formatDate,
  encodeWAV,
  mergeChunks,
  getAudioDuration,
} from '../utils'

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should handle tailwind class conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('should handle arrays and objects', () => {
    expect(cn(['foo', 'bar'], { baz: true, qux: false })).toBe('foo bar baz')
  })
})

describe('convertFloat32ToInt16', () => {
  it('should convert float32 samples to int16', () => {
    const input = new Float32Array([0, 0.5, -0.5, 1, -1])
    const result = convertFloat32ToInt16(input)

    expect(result).toBeInstanceOf(Int16Array)
    expect(result.length).toBe(5)
    expect(result[0]).toBe(0)
    expect(result[3]).toBe(32767)
    expect(result[4]).toBe(-32768)
  })

  it('should clamp values outside -1 to 1 range', () => {
    const input = new Float32Array([1.5, -1.5])
    const result = convertFloat32ToInt16(input)

    expect(result[0]).toBe(32767)
    expect(result[1]).toBe(-32768)
  })

  it('should handle empty array', () => {
    const input = new Float32Array([])
    const result = convertFloat32ToInt16(input)

    expect(result.length).toBe(0)
  })

  it('should handle very small values', () => {
    const input = new Float32Array([0.0001, -0.0001])
    const result = convertFloat32ToInt16(input)

    expect(result[0]).toBeGreaterThan(-10)
    expect(result[0]).toBeLessThan(10)
  })
})

describe('waitFor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should wait for default timeout', async () => {
    const consoleSpy = vi.spyOn(console, 'log')
    const promise = waitFor()

    vi.advanceTimersByTime(5000)
    await promise

    expect(consoleSpy).toHaveBeenCalledWith('Wait for ', 5, ' seconds!')
  })

  it('should wait for custom timeout', async () => {
    const consoleSpy = vi.spyOn(console, 'log')
    const promise = waitFor(1000)

    vi.advanceTimersByTime(1000)
    await promise

    expect(consoleSpy).toHaveBeenCalledWith('Wait for ', 1, ' seconds!')
  })

  it('should not resolve before timeout', async () => {
    let resolved = false
    const promise = waitFor(1000).then(() => {
      resolved = true
    })

    vi.advanceTimersByTime(500)
    await Promise.resolve()

    expect(resolved).toBe(false)

    vi.advanceTimersByTime(500)
    await promise

    expect(resolved).toBe(true)
  })
})

describe('formatDuration', () => {
  it('should format seconds only', () => {
    expect(formatDuration(45)).toBe('0m 45s')
  })

  it('should format minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2m 5s')
  })

  it('should format hours, minutes, and seconds', () => {
    expect(formatDuration(3665)).toBe('1h 1m 5s')
  })

  it('should handle zero', () => {
    expect(formatDuration(0)).toBe('0m 0s')
  })

  it('should handle large durations', () => {
    expect(formatDuration(7322)).toBe('2h 2m 2s')
  })

  it('should floor decimal seconds', () => {
    expect(formatDuration(125.9)).toBe('2m 5s')
  })

  it('should handle 60 seconds', () => {
    expect(formatDuration(60)).toBe('1m 0s')
  })

  it('should handle 3600 seconds (1 hour)', () => {
    expect(formatDuration(3600)).toBe('1h 0m 0s')
  })
})

describe('formatFileSize', () => {
  it('should format bytes to MB', () => {
    expect(formatFileSize(1048576)).toBe('1.00 MB')
  })

  it('should format bytes to GB', () => {
    expect(formatFileSize(1073741824)).toBe('1.00 GB')
  })

  it('should handle small files', () => {
    expect(formatFileSize(512000)).toBe('0.49 MB')
  })

  it('should handle zero bytes', () => {
    expect(formatFileSize(0)).toBe('0.00 MB')
  })

  it('should handle fractional MB', () => {
    expect(formatFileSize(1572864)).toBe('1.50 MB')
  })

  it('should handle large GB files', () => {
    expect(formatFileSize(5368709120)).toBe('5.00 GB')
  })

  it('should round to 2 decimal places', () => {
    const result = formatFileSize(1234567)
    expect(result).toMatch(/^\d+\.\d{2} MB$/)
  })
})

describe('formatDate', () => {
  it('should format ISO date string', () => {
    const result = formatDate('2023-10-05T14:48:00.000Z')
    expect(result).toContain('Oct')
    expect(result).toContain('5')
    expect(result).toContain('2023')
  })

  it('should include time', () => {
    const result = formatDate('2023-10-05T14:48:00.000Z')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })

  it('should handle different dates', () => {
    const result = formatDate('2024-01-15T09:30:00.000Z')
    expect(result).toContain('Jan')
    expect(result).toContain('15')
  })
})

describe('encodeWAV', () => {
  it('should encode PCM samples to WAV blob', () => {
    const samples = new Int16Array([100, -100, 200, -200])
    const result = encodeWAV(samples, 16000)

    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('audio/wav')
    expect(result.size).toBe(44 + samples.length * 2)
  })

  it('should handle empty samples', () => {
    const samples = new Int16Array([])
    const result = encodeWAV(samples)

    expect(result.size).toBe(44)
  })

  it('should use custom sample rate', () => {
    const samples = new Int16Array([100, 200])
    const result = encodeWAV(samples, 44100)

    expect(result).toBeInstanceOf(Blob)
    expect(result.size).toBe(44 + samples.length * 2)
  })

  it('should handle large sample arrays', () => {
    const samples = new Int16Array(10000)
    for (let i = 0; i < samples.length; i++) {
      samples[i] = i % 32767
    }
    const result = encodeWAV(samples)

    expect(result.size).toBe(44 + 10000 * 2)
  })
})

describe('mergeChunks', () => {
  it('should merge multiple Uint8Array chunks', () => {
    const chunk1 = new Uint8Array([1, 2, 3])
    const chunk2 = new Uint8Array([4, 5, 6])
    const chunk3 = new Uint8Array([7, 8, 9])

    const result = mergeChunks([chunk1, chunk2, chunk3])

    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBe(9)
    expect(Array.from(result)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('should handle empty chunks array', () => {
    const result = mergeChunks([])

    expect(result.length).toBe(0)
  })

  it('should handle single chunk', () => {
    const chunk = new Uint8Array([1, 2, 3])
    const result = mergeChunks([chunk])

    expect(Array.from(result)).toEqual([1, 2, 3])
  })

  it('should handle chunks of different sizes', () => {
    const chunk1 = new Uint8Array([1])
    const chunk2 = new Uint8Array([2, 3, 4, 5])
    const chunk3 = new Uint8Array([6, 7])

    const result = mergeChunks([chunk1, chunk2, chunk3])

    expect(result.length).toBe(7)
    expect(Array.from(result)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('should preserve byte values', () => {
    const chunk1 = new Uint8Array([0, 255])
    const chunk2 = new Uint8Array([128, 64])

    const result = mergeChunks([chunk1, chunk2])

    expect(Array.from(result)).toEqual([0, 255, 128, 64])
  })
})

describe('getAudioDuration', () => {
  it('should return duration for valid audio blob', async () => {
    const mockBlob = new Blob(['mock audio data'], { type: 'audio/wav' })
    const mockDuration = 42.5

    const mockAudio = {
      src: '',
      duration: mockDuration,
      addEventListener: vi.fn((event, callback) => {
        if (event === 'loadedmetadata') {
          setTimeout(() => callback(), 0)
        }
      }),
    }

    vi.spyOn(document, 'createElement').mockReturnValue(mockAudio as any)

    const duration = await getAudioDuration(mockBlob)

    expect(duration).toBe(mockDuration)
  })

  it('should reject on audio error', async () => {
    const mockBlob = new Blob(['mock audio data'], { type: 'audio/wav' })
    const mockError = new Error('Failed to load audio')

    const mockAudio = {
      src: '',
      addEventListener: vi.fn((event, callback) => {
        if (event === 'error') {
          setTimeout(() => callback(mockError), 0)
        }
      }),
    }

    vi.spyOn(document, 'createElement').mockReturnValue(mockAudio as any)

    await expect(getAudioDuration(mockBlob)).rejects.toEqual(mockError)
  })

  it('should revoke object URL on success', async () => {
    const mockBlob = new Blob(['mock audio data'], { type: 'audio/wav' })
    const revokeURLSpy = vi.spyOn(URL, 'revokeObjectURL')

    const mockAudio = {
      src: '',
      duration: 10,
      addEventListener: vi.fn((event, callback) => {
        if (event === 'loadedmetadata') {
          setTimeout(() => callback(), 0)
        }
      }),
    }

    vi.spyOn(document, 'createElement').mockReturnValue(mockAudio as any)

    await getAudioDuration(mockBlob)

    expect(revokeURLSpy).toHaveBeenCalled()
  })
})