import { render, screen } from '@testing-library/react'
import Layout from '@/components/layout/RootLayout'
import type { User } from '@/types'

// Mock next/head
jest.mock('next/head', () => {
  const MockHead = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )
  MockHead.displayName = 'MockHead'
  return MockHead
})

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

describe('Layout component', () => {
  it('should render children', () => {
    render(
      <Layout>
        <div data-testid="child-content">Test Content</div>
      </Layout>,
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should render Header component', () => {
    render(
      <Layout>
        <div>Content</div>
      </Layout>,
    )

    // Header should show login/register when no user
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
  })

  it('should pass userObject to Header', () => {
    const mockUser: User = {
      id: 1,
      username: 'layoutuser',
    }

    render(
      <Layout userObject={mockUser}>
        <div>Content</div>
      </Layout>,
    )

    expect(screen.getByText('Hi layoutuser')).toBeInTheDocument()
  })

  it('should render children inside main element', () => {
    render(
      <Layout>
        <p>Main content here</p>
      </Layout>,
    )

    const mainElement = screen.getByRole('main')
    expect(mainElement).toBeInTheDocument()
    expect(mainElement).toHaveTextContent('Main content here')
  })

  it('should render multiple children', () => {
    render(
      <Layout>
        <div data-testid="first">First</div>
        <div data-testid="second">Second</div>
        <div data-testid="third">Third</div>
      </Layout>,
    )

    expect(screen.getByTestId('first')).toBeInTheDocument()
    expect(screen.getByTestId('second')).toBeInTheDocument()
    expect(screen.getByTestId('third')).toBeInTheDocument()
  })
})
