import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TranscriptDetails } from '../transcript-details'
import { Transcript } from '@/types/transcription'

const mockTranscript: Transcript = {
  id: 'transcript-123456789',
  audio_id: 'audio-123',
  text: 'This is a sample transcript text that contains multiple words and sentences.',
  created_at: '2024-01-01T14:48:00.000Z',
}

describe('TranscriptDetails', () => {
  it('should render transcript text', () => {
    render(<TranscriptDetails transcript={mockTranscript} />)

    expect(screen.getByText(mockTranscript.text)).toBeInTheDocument()
  })

  it('should render truncated transcript ID', () => {
    render(<TranscriptDetails transcript={mockTranscript} />)

    expect(screen.getByText(/ID: transcri.../)).toBeInTheDocument()
  })

  it('should render transcribed date label', () => {
    render(<TranscriptDetails transcript={mockTranscript} />)

    expect(screen.getByText('Transcribed')).toBeInTheDocument()
  })

  it('should render transcript text header', () => {
    render(<TranscriptDetails transcript={mockTranscript} />)

    expect(screen.getByText('Transcript Text')).toBeInTheDocument()
  })

  it('should handle transcript without ID', () => {
    const transcriptNoId = { ...mockTranscript, id: undefined as any }
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<TranscriptDetails transcript={transcriptNoId} />)

    expect(screen.getByText('ID: N/A')).toBeInTheDocument()
    expect(consoleSpy).toHaveBeenCalledWith('Transcript ID is undefined', transcriptNoId)
  })

  it('should render calendar icon', () => {
    const { container } = render(<TranscriptDetails transcript={mockTranscript} />)

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('should render formatted date', () => {
    render(<TranscriptDetails transcript={mockTranscript} />)

    const dateText = screen.getAllByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)
    expect(dateText.length).toBeGreaterThan(0)
  })

  it('should handle empty transcript text', () => {
    const emptyTranscript = { ...mockTranscript, text: '' }

    render(<TranscriptDetails transcript={emptyTranscript} />)

    const textElement = screen.getByText('')
    expect(textElement).toBeInTheDocument()
  })

  it('should handle very long transcript ID', () => {
    const longIdTranscript = { ...mockTranscript, id: 'a'.repeat(100) }

    render(<TranscriptDetails transcript={longIdTranscript} />)

    expect(screen.getByText(/ID: aaaaaaaa.../)).toBeInTheDocument()
  })
})