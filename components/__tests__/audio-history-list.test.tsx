import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AudioHistoryList } from '../audio-history-list'
import { AudioFile } from '@/types/transcription'

const mockAudioFiles: AudioFile[] = [
  {
    id: '1',
    user_id: 'user-123',
    name: 'Today Audio 1',
    url: 'https://example.com/audio1.wav',
    duration: 120,
    file_size: 1024000,
    mime_type: 'audio/wav',
    transcription_status: 'done',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'user-123',
    name: 'Yesterday Audio',
    url: 'https://example.com/audio2.wav',
    duration: 90,
    file_size: 512000,
    mime_type: 'audio/wav',
    transcription_status: 'processing',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

describe('AudioHistoryList', () => {
  it('should render audio history grouped by day', () => {
    render(<AudioHistoryList audioHistory={mockAudioFiles} />)

    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Yesterday')).toBeInTheDocument()
  })

  it('should render audio file names', () => {
    render(<AudioHistoryList audioHistory={mockAudioFiles} />)

    expect(screen.getByText('Today Audio 1')).toBeInTheDocument()
    expect(screen.getByText('Yesterday Audio')).toBeInTheDocument()
  })

  it('should handle empty audio history', () => {
    const { container } = render(<AudioHistoryList audioHistory={[]} />)

    expect(container.querySelector('.space-y-6')).toBeInTheDocument()
    expect(screen.queryByText('Today')).not.toBeInTheDocument()
  })

  it('should group audio files with invalid dates', () => {
    const audioWithInvalidDate: AudioFile[] = [
      {
        id: '3',
        user_id: 'user-123',
        name: 'Invalid Date Audio',
        url: 'https://example.com/audio3.wav',
        duration: 60,
        file_size: 256000,
        mime_type: 'audio/wav',
        transcription_status: 'done',
        created_at: 'invalid-date',
        updated_at: 'invalid-date',
      },
    ]

    render(<AudioHistoryList audioHistory={audioWithInvalidDate} />)

    expect(screen.getByText('Unknown Date')).toBeInTheDocument()
    expect(screen.getByText('Invalid Date Audio')).toBeInTheDocument()
  })

  it('should sort day groups in descending order', () => {
    const { container } = render(<AudioHistoryList audioHistory={mockAudioFiles} />)

    const dayHeaders = container.querySelectorAll('h2')
    expect(dayHeaders[0]).toHaveTextContent('Today')
    expect(dayHeaders[1]).toHaveTextContent('Yesterday')
  })

  it('should render multiple audios in the same day group', () => {
    const sameDayAudios: AudioFile[] = [
      { ...mockAudioFiles[0], id: '1', name: 'Audio 1' },
      { ...mockAudioFiles[0], id: '2', name: 'Audio 2' },
      { ...mockAudioFiles[0], id: '3', name: 'Audio 3' },
    ]

    render(<AudioHistoryList audioHistory={sameDayAudios} />)

    expect(screen.getByText('Audio 1')).toBeInTheDocument()
    expect(screen.getByText('Audio 2')).toBeInTheDocument()
    expect(screen.getByText('Audio 3')).toBeInTheDocument()
  })

  it('should format date with year when different from current year', () => {
    const oldAudio: AudioFile[] = [
      {
        ...mockAudioFiles[0],
        created_at: '2020-01-15T12:00:00Z',
      },
    ]

    render(<AudioHistoryList audioHistory={oldAudio} />)

    expect(screen.getByText(/Jan 15, 2020/)).toBeInTheDocument()
  })
})