import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TimeDisplay from '../time-display'

describe('TimeDisplay', () => {
  beforeEach(() => {
    // Mock Date to have consistent timezone
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render formatted time', async () => {
    render(<TimeDisplay dateString="2024-01-01T14:48:00.000Z" />)

    await waitFor(() => {
      const timeElement = screen.getByText(/\d{2}:\d{2}/)
      expect(timeElement).toBeInTheDocument()
    })
  })

  it('should handle invalid date string', async () => {
    render(<TimeDisplay dateString="invalid-date" />)

    await waitFor(() => {
      expect(screen.getByText('--:--')).toBeInTheDocument()
    })
  })

  it('should format time with AM/PM', async () => {
    render(<TimeDisplay dateString="2024-01-01T14:30:00.000Z" />)

    await waitFor(() => {
      const text = screen.getByText(/[AP]M/)
      expect(text).toBeInTheDocument()
    })
  })

  it('should handle midnight', async () => {
    render(<TimeDisplay dateString="2024-01-01T00:00:00.000Z" />)

    await waitFor(() => {
      const timeElement = screen.getByText(/12:00/)
      expect(timeElement).toBeInTheDocument()
    })
  })

  it('should handle noon', async () => {
    render(<TimeDisplay dateString="2024-01-01T12:00:00.000Z" />)

    await waitFor(() => {
      const timeElement = screen.getByText(/12:00/)
      expect(timeElement).toBeInTheDocument()
    })
  })
})