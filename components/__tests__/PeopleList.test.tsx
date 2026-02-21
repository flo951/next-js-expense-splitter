import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PeopleList from '../PeopleList'

// Mock page-level style imports to avoid loading database-connected page modules
jest.mock('../../pages/createevent', () => ({
  formStyles: {},
  spanStyles: {},
  divPersonListStyles: {},
  inputSubmitStyles: {},
  nameInputStyles: {},
  personStyles: {},
}))

jest.mock('../../pages/users/[eventId]', () => ({
  removeButtonStyles: {},
}))

const mockUser = { id: 1, username: 'alice' }

const mockPeople = [
  { id: 10, name: 'Bob', event_id: 5, user_id: 1 },
  { id: 11, name: 'Charlie', event_id: 5, user_id: 1 },
]

const mockExpenses = [
  {
    id: 100,
    expensename: 'Dinner',
    cost: 9000,
    event_id: 5,
    paymaster: 10,
    participantIds: [10, 11],
  },
]

function renderPeopleList(
  overrides: Partial<React.ComponentProps<typeof PeopleList>> = {},
) {
  const defaults = {
    user: mockUser,
    setErrors: jest.fn(),
    expenseList: mockExpenses,
    setExpenseList: jest.fn(),
    eventId: 5,
    setPeopleList: jest.fn(),
    peopleList: mockPeople,
  }
  return render(<PeopleList {...defaults} {...overrides} />)
}

describe('PeopleList component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  describe('rendering', () => {
    it('renders the name input and submit button', () => {
      renderPeopleList()

      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Add Person')).toBeInTheDocument()
    })

    it('renders each person in the list', () => {
      renderPeopleList()

      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
    })

    it('renders a delete button for each person', () => {
      renderPeopleList()

      expect(
        screen.getByLabelText('Delete Button for Person: Bob'),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText('Delete Button for Person: Charlie'),
      ).toBeInTheDocument()
    })

    it('renders no people when the list is empty', () => {
      renderPeopleList({ peopleList: [] })

      expect(screen.queryByLabelText(/Delete Button/)).not.toBeInTheDocument()
    })
  })

  describe('adding a person', () => {
    it('calls fetch POST and updates the people list on success', async () => {
      const newPerson = { id: 12, name: 'Diana', event_id: 5, user_id: 1 }
      jest.mocked(global.fetch).mockResolvedValue({
        json: async () => ({ person: newPerson }),
      } as Response)

      const setPeopleList = jest.fn()
      renderPeopleList({ setPeopleList })

      fireEvent.change(screen.getByPlaceholderText('Name'), {
        target: { value: 'Diana' },
      })
      fireEvent.click(screen.getByDisplayValue('Add Person'))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/person',
          expect.objectContaining({ method: 'POST' }),
        )
        expect(setPeopleList).toHaveBeenCalledWith([...mockPeople, newPerson])
      })
    })

    it('calls setErrors when the API returns errors', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        json: async () => ({ errors: [{ message: 'Name not provided' }] }),
      } as Response)

      const setErrors = jest.fn()
      renderPeopleList({ setErrors })

      fireEvent.change(screen.getByPlaceholderText('Name'), {
        target: { value: 'test' },
      })
      fireEvent.click(screen.getByDisplayValue('Add Person'))

      await waitFor(() => {
        expect(setErrors).toHaveBeenCalledWith([
          { message: 'Name not provided' },
        ])
      })
    })
  })

  describe('deleting a person', () => {
    it('calls fetch DELETE and removes person from list', async () => {
      const deletedPerson = mockPeople[0]!
      jest.mocked(global.fetch).mockResolvedValue({
        json: async () => ({ person: deletedPerson }),
      } as Response)

      const setPeopleList = jest.fn()
      renderPeopleList({ setPeopleList })

      fireEvent.click(screen.getByLabelText('Delete Button for Person: Bob'))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/person',
          expect.objectContaining({
            method: 'DELETE',
            body: JSON.stringify({ personId: 10, user: mockUser }),
          }),
        )
        expect(setPeopleList).toHaveBeenCalledWith(
          mockPeople.filter((p) => p.id !== deletedPerson.id),
        )
      })
    })

    it('removes the deleted person from expense participantIds', async () => {
      const deletedPerson = mockPeople[1]! // Charlie (id: 11)
      jest.mocked(global.fetch).mockResolvedValue({
        json: async () => ({ person: deletedPerson }),
      } as Response)

      const setExpenseList = jest.fn()
      renderPeopleList({ setExpenseList })

      fireEvent.click(
        screen.getByLabelText('Delete Button for Person: Charlie'),
      )

      await waitFor(() => {
        expect(setExpenseList).toHaveBeenCalledWith([
          expect.objectContaining({ participantIds: [10] }),
        ])
      })
    })

    it('removes expenses where the deleted person is the paymaster', async () => {
      const deletedPerson = mockPeople[0]! // Bob (id: 10) — is paymaster of the expense
      jest.mocked(global.fetch).mockResolvedValue({
        json: async () => ({ person: deletedPerson }),
      } as Response)

      const setExpenseList = jest.fn()
      renderPeopleList({ setExpenseList })

      fireEvent.click(screen.getByLabelText('Delete Button for Person: Bob'))

      await waitFor(() => {
        // The expense with paymaster=10 should be removed entirely
        expect(setExpenseList).toHaveBeenCalledWith([])
      })
    })

    it('calls setErrors when the DELETE API returns errors', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        json: async () => ({ errors: [{ message: 'Not found' }] }),
      } as Response)

      const setErrors = jest.fn()
      renderPeopleList({ setErrors })

      fireEvent.click(screen.getByLabelText('Delete Button for Person: Bob'))

      await waitFor(() => {
        expect(setErrors).toHaveBeenCalledWith([{ message: 'Not found' }])
      })
    })
  })
})
