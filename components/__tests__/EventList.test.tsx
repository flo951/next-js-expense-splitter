import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventList from '@/components/events/EventList'
import type { Event, User } from '@/types'

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

// Mock next/image
jest.mock('next/image', () => {
  const MockImage = ({
    src,
    alt,
  }: {
    src: string
    alt: string
    width?: number
    height?: number
    // eslint-disable-next-line @next/next/no-img-element
  }) => <img src={src} alt={alt} />
  MockImage.displayName = 'MockImage'
  return MockImage
})

// Mock fetch for delete operations
global.fetch = jest.fn()

describe('EventList component', () => {
  const mockUser: User = {
    id: 1,
    username: 'testuser',
  }

  const mockEvents: Event[] = [
    {
      id: 1,
      eventname: 'Beach Party',
      user_id: 1,
      imageurl: null,
    },
    {
      id: 2,
      eventname: 'Birthday',
      user_id: 1,
      imageurl: '/images/birthday.jpg',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render event list with events', () => {
      render(<EventList eventsInDb={mockEvents} user={mockUser} />)

      expect(screen.getByText('Beach Party')).toBeInTheDocument()
      expect(screen.getByText('Birthday')).toBeInTheDocument()
    })

    it('should display message when no events exist', () => {
      render(<EventList eventsInDb={[]} user={mockUser} />)

      expect(
        screen.getByText(
          /You have no events yet, click on the Link above to create an event/i,
        ),
      ).toBeInTheDocument()
    })

    it('should show username in heading when events exist', () => {
      render(<EventList eventsInDb={mockEvents} user={mockUser} />)

      expect(
        screen.getByText(/This are your events testuser/i),
      ).toBeInTheDocument()
    })

    it('should render event images with correct src', () => {
      render(<EventList eventsInDb={mockEvents} user={mockUser} />)

      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(2)

      // First event has no image, should use default
      expect(images[0]).toHaveAttribute(
        'src',
        '/images/maldives-1993704_640.jpg',
      )

      // Second event has custom image
      expect(images[1]).toHaveAttribute('src', '/images/birthday.jpg')
    })

    it('should render links to event detail pages', () => {
      render(<EventList eventsInDb={mockEvents} user={mockUser} />)

      const links = screen.getAllByRole('link')
      // 2 events = 2 links (wrapping event content)
      expect(links.length).toBeGreaterThanOrEqual(2)
      expect(links[0]).toHaveAttribute('href', '/events/1')
      expect(links[1]).toHaveAttribute('href', '/events/2')
    })

    it('should render delete buttons for each event', () => {
      render(<EventList eventsInDb={mockEvents} user={mockUser} />)

      const deleteButtons = screen.getAllByRole('button')
      expect(deleteButtons).toHaveLength(2)
      expect(deleteButtons[0]).toHaveTextContent('X')
      expect(deleteButtons[1]).toHaveTextContent('X')
    })
  })

  describe('state synchronization', () => {
    it('should update list when eventsInDb prop changes', () => {
      const { rerender } = render(
        <EventList eventsInDb={mockEvents} user={mockUser} />,
      )

      expect(screen.getByText('Beach Party')).toBeInTheDocument()
      expect(screen.getByText('Birthday')).toBeInTheDocument()

      // Add a new event via prop change
      const newEvent: Event = {
        id: 3,
        eventname: 'New Year Party',
        user_id: 1,
        imageurl: null,
      }

      rerender(
        <EventList eventsInDb={[...mockEvents, newEvent]} user={mockUser} />,
      )

      // New event should appear immediately
      expect(screen.getByText('New Year Party')).toBeInTheDocument()
      expect(screen.getByText('Beach Party')).toBeInTheDocument()
      expect(screen.getByText('Birthday')).toBeInTheDocument()
    })

    it('should update when event is removed from props', () => {
      const { rerender } = render(
        <EventList eventsInDb={mockEvents} user={mockUser} />,
      )

      expect(screen.getByText('Beach Party')).toBeInTheDocument()
      expect(screen.getByText('Birthday')).toBeInTheDocument()

      // Remove first event
      rerender(<EventList eventsInDb={[mockEvents[1]]} user={mockUser} />)

      expect(screen.queryByText('Beach Party')).not.toBeInTheDocument()
      expect(screen.getByText('Birthday')).toBeInTheDocument()
    })

    it('should handle going from empty to having events', () => {
      const { rerender } = render(
        <EventList eventsInDb={[]} user={mockUser} />,
      )

      expect(
        screen.getByText(
          /You have no events yet, click on the Link above to create an event/i,
        ),
      ).toBeInTheDocument()

      // Add events
      rerender(<EventList eventsInDb={mockEvents} user={mockUser} />)

      expect(
        screen.queryByText(/You have no events yet/i),
      ).not.toBeInTheDocument()
      expect(screen.getByText('Beach Party')).toBeInTheDocument()
    })
  })

  describe('delete functionality', () => {
    it('should call API and remove event from list on delete', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          event: { id: 1, eventname: 'Beach Party', user_id: 1 },
        }),
      })

      render(<EventList eventsInDb={mockEvents} user={mockUser} />)

      const deleteButtons = screen.getAllByRole('button')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/events/1',
          expect.objectContaining({
            method: 'DELETE',
          }),
        )
      })

      await waitFor(() => {
        expect(screen.queryByText('Beach Party')).not.toBeInTheDocument()
      })
      expect(screen.getByText('Birthday')).toBeInTheDocument()
    })

    it('should display error when delete fails', async () => {
      const user = userEvent.setup()

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({
          errors: [{ message: 'Failed to delete event' }],
        }),
      })

      render(<EventList eventsInDb={mockEvents} user={mockUser} />)

      const deleteButtons = screen.getAllByRole('button')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByText('Failed to delete event')).toBeInTheDocument()
      })

      // Event should still be in the list
      expect(screen.getByText('Beach Party')).toBeInTheDocument()
    })
  })
})
