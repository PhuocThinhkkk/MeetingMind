import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SignOutBtn } from '../sign-out-btn'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

vi.mock('@/hooks/use-auth')
vi.mock('next/navigation')

describe('SignOutBtn', () => {
  it('should render sign out button', () => {
    const mockSignOut = vi.fn()
    const mockPush = vi.fn()

    vi.mocked(useAuth).mockReturnValue({
      signOut: mockSignOut,
      user: null,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
    })

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any)

    render(<SignOutBtn />)

    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('should call signOut and redirect on click', async () => {
    const mockSignOut = vi.fn().mockResolvedValue(undefined)
    const mockPush = vi.fn()

    vi.mocked(useAuth).mockReturnValue({
      signOut: mockSignOut,
      user: null,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
    })

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any)

    render(<SignOutBtn />)

    const button = screen.getByText('Sign Out')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('should render with LogOut icon', () => {
    const mockSignOut = vi.fn()
    const mockPush = vi.fn()

    vi.mocked(useAuth).mockReturnValue({
      signOut: mockSignOut,
      user: null,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
    })

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as any)

    const { container } = render(<SignOutBtn />)

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})