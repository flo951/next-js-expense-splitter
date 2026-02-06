import { render, screen } from '@testing-library/react'
import Header from '../Header'
import type { User } from '../../util/database'

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('Header component', () => {
  describe('when user is not logged in', () => {
    it('should render Splitify link', () => {
      render(<Header />)

      expect(screen.getByText('Splitify')).toBeInTheDocument()
    })

    it('should render Register link', () => {
      render(<Header />)

      const registerLink = screen.getByText('Register')
      expect(registerLink).toBeInTheDocument()
      expect(registerLink).toHaveAttribute('href', '/register')
    })

    it('should render Login link', () => {
      render(<Header />)

      const loginLink = screen.getByText('Login')
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('should not render Overview link', () => {
      render(<Header />)

      expect(screen.queryByText('Overview')).not.toBeInTheDocument()
    })

    it('should not render Logout link', () => {
      render(<Header />)

      expect(screen.queryByText('Logout')).not.toBeInTheDocument()
    })
  })

  describe('when user is logged in', () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
    }

    it('should render greeting with username', () => {
      render(<Header userObject={mockUser} />)

      expect(screen.getByText('Hi testuser')).toBeInTheDocument()
    })

    it('should render Overview link', () => {
      render(<Header userObject={mockUser} />)

      const overviewLink = screen.getByText('Overview')
      expect(overviewLink).toBeInTheDocument()
      expect(overviewLink).toHaveAttribute('href', '/overview')
    })

    it('should render Create New Event link', () => {
      render(<Header userObject={mockUser} />)

      const createEventLink = screen.getByText('Create New Event')
      expect(createEventLink).toBeInTheDocument()
      expect(createEventLink).toHaveAttribute('href', '/createevent')
    })

    it('should render Logout link', () => {
      render(<Header userObject={mockUser} />)

      const logoutLink = screen.getByText('Logout')
      expect(logoutLink).toBeInTheDocument()
      expect(logoutLink).toHaveAttribute('href', '/logout')
    })

    it('should not render Register link', () => {
      render(<Header userObject={mockUser} />)

      expect(screen.queryByText('Register')).not.toBeInTheDocument()
    })

    it('should not render Login link', () => {
      render(<Header userObject={mockUser} />)

      expect(screen.queryByText('Login')).not.toBeInTheDocument()
    })

    it('should have correct data-test-id for logged in user', () => {
      render(<Header userObject={mockUser} />)

      // The component uses data-test-id (not data-testid)
      const userSpan = screen.getByText('Hi testuser').closest('span')
      expect(userSpan).toHaveAttribute('data-test-id', 'logged-in-user')
    })
  })
})
