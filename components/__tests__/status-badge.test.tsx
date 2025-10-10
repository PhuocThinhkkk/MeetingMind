import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../status-badge'

describe('StatusBadge', () => {
  it('should render done status', () => {
    render(<StatusBadge status="done" />)
    expect(screen.getByText('done')).toBeInTheDocument()
  })

  it('should render processing status', () => {
    render(<StatusBadge status="processing" />)
    expect(screen.getByText('processing')).toBeInTheDocument()
  })

  it('should render error status', () => {
    render(<StatusBadge status="error" />)
    expect(screen.getByText('error')).toBeInTheDocument()
  })

  it('should render unknown status for unrecognized values', () => {
    render(<StatusBadge status="invalid-status" />)
    expect(screen.getByText('unknown')).toBeInTheDocument()
  })

  it('should apply correct styling for done status', () => {
    const { container } = render(<StatusBadge status="done" />)
    const badge = container.querySelector('.bg-green-500\\/10')
    expect(badge).toBeInTheDocument()
  })

  it('should apply correct styling for processing status', () => {
    const { container } = render(<StatusBadge status="processing" />)
    const badge = container.querySelector('.bg-blue-500\\/10')
    expect(badge).toBeInTheDocument()
  })

  it('should apply correct styling for error status', () => {
    const { container } = render(<StatusBadge status="error" />)
    const badge = container.querySelector('.bg-red-500\\/10')
    expect(badge).toBeInTheDocument()
  })

  it('should render with icon', () => {
    const { container } = render(<StatusBadge status="done" />)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})