import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExpenseList from '../ExpenseList'

// Mock page-level style imports to avoid loading database-connected page modules
jest.mock('../../pages/createevent', () => ({
  formStyles: {},
  spanStyles: {},
}))

jest.mock('../../pages/users/[eventId]', () => ({
  expenseContainerStyles: {},
  expenseDetailStyles: {},
  inputExpenseStyles: {},
  inputExpenseSubmitStyles: {},
  removeButtonStyles: {},
  selectStyles: {},
  spanErrorStyles: {},
}))

const mockPeople = [
  { id: 10, name: 'Alice', event_id: 5, user_id: 1 },
  { id: 11, name: 'Bob', event_id: 5, user_id: 1 },
]

const mockExpense = {
  id: 100,
  expensename: 'Dinner',
  cost: 9000,
  event_id: 5,
  paymaster: 10,
  participantIds: [10, 11],
}

type ExpenseListProps = React.ComponentProps<typeof ExpenseList>

function renderExpenseList(overrides: Partial<ExpenseListProps> = {}) {
  const defaults: ExpenseListProps = {
    personExpense: '0',
    setPersonExpense: jest.fn(),
    expenseError: '',
    setExpenseError: jest.fn(),
    selectedPersonId: 10,
    selectedParticipants: [10, 11],
    setSelectedParticipants: jest.fn(),
    expenseName: 'Dinner',
    setExpenseName: jest.fn(),
    expenseList: [],
    setExpenseList: jest.fn(),
    setErrors: jest.fn(),
    peopleList: mockPeople,
    eventId: 5,
    deleteExpense: jest.fn(),
    handleSelectPerson: jest.fn(),
  }
  return render(<ExpenseList {...defaults} {...overrides} />)
}

describe('ExpenseList component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  describe('rendering', () => {
    it('renders the expense form inputs', () => {
      renderExpenseList()

      expect(screen.getByTestId('expense-value')).toBeInTheDocument()
      expect(screen.getByTestId('expense-name')).toBeInTheDocument()
      expect(screen.getByTestId('complete-expense')).toBeInTheDocument()
    })

    it('renders a checkbox for each person', () => {
      renderExpenseList()

      expect(screen.getByLabelText(/Alice/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Bob/)).toBeInTheDocument()
    })

    it('renders the paymaster select dropdown with all people as options', () => {
      renderExpenseList()

      const select = screen.getByTestId('select-person')
      expect(select).toBeInTheDocument()
      // Each name appears in both a <option> and a checkbox label — use getAllByText
      expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Bob').length).toBeGreaterThanOrEqual(1)
    })

    it('renders existing expenses in the list', () => {
      renderExpenseList({ expenseList: [mockExpense] })

      expect(screen.getByTestId('expense-value-name')).toBeInTheDocument()
      expect(screen.getByText(/Dinner/)).toBeInTheDocument()
    })

    it('renders a delete button for each existing expense', () => {
      renderExpenseList({ expenseList: [mockExpense] })

      expect(
        screen.getByLabelText('Delete Button for Expense: Dinner'),
      ).toBeInTheDocument()
    })

    it('renders an error message when expenseError is set', () => {
      renderExpenseList({ expenseError: 'Please select a person' })

      expect(screen.getByText('Please select a person')).toBeInTheDocument()
    })
  })

  describe('client-side validation', () => {
    it('shows error when cost is 0 or negative', async () => {
      const setExpenseError = jest.fn()
      renderExpenseList({ personExpense: '0', setExpenseError })

      fireEvent.submit(screen.getByTestId('complete-expense').closest('form')!)

      await waitFor(() => {
        expect(setExpenseError).toHaveBeenCalledWith(
          'Invalid input, please enter a positive value',
        )
      })
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('shows error when no paymaster is selected (selectedPersonId is 0)', async () => {
      const setExpenseError = jest.fn()
      renderExpenseList({
        personExpense: '50',
        selectedPersonId: 0,
        setExpenseError,
      })

      fireEvent.submit(screen.getByTestId('complete-expense').closest('form')!)

      await waitFor(() => {
        expect(setExpenseError).toHaveBeenCalledWith('Please select a person')
      })
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('shows error when no participants are selected', async () => {
      const setExpenseError = jest.fn()
      renderExpenseList({
        personExpense: '50',
        selectedPersonId: 10,
        selectedParticipants: [],
        setExpenseError,
      })

      fireEvent.submit(screen.getByTestId('complete-expense').closest('form')!)

      await waitFor(() => {
        expect(setExpenseError).toHaveBeenCalledWith(
          'Please select at least one participant',
        )
      })
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('submitting an expense', () => {
    it('calls fetch POST with correct payload', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        json: async () => ({ expense: mockExpense }),
      } as Response)

      renderExpenseList({
        personExpense: '90',
        expenseName: 'Dinner',
        selectedPersonId: 10,
        selectedParticipants: [10, 11],
      })

      fireEvent.submit(screen.getByTestId('complete-expense').closest('form')!)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/expense',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              expensename: 'Dinner',
              cost: 9000, // 90 * 100 = 9000 cents
              eventId: 5,
              paymaster: 10,
              participantIds: [10, 11],
            }),
          }),
        )
      })
    })

    it('appends the new expense to the list on success', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        json: async () => ({ expense: mockExpense }),
      } as Response)

      const setExpenseList = jest.fn()
      renderExpenseList({
        personExpense: '90',
        expenseList: [],
        setExpenseList,
      })

      fireEvent.submit(screen.getByTestId('complete-expense').closest('form')!)

      await waitFor(() => {
        expect(setExpenseList).toHaveBeenCalledWith([mockExpense])
      })
    })

    it('calls setErrors when the API returns errors', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        json: async () => ({ errors: [{ message: 'Paymaster invalid' }] }),
      } as Response)

      const setErrors = jest.fn()
      renderExpenseList({ personExpense: '90', setErrors })

      fireEvent.submit(screen.getByTestId('complete-expense').closest('form')!)

      await waitFor(() => {
        expect(setErrors).toHaveBeenCalledWith([{ message: 'Paymaster invalid' }])
      })
    })
  })

  describe('deleting an expense', () => {
    it('calls deleteExpense with the correct expense id', () => {
      const deleteExpense = jest.fn()
      renderExpenseList({ expenseList: [mockExpense], deleteExpense })

      fireEvent.click(screen.getByLabelText('Delete Button for Expense: Dinner'))

      expect(deleteExpense).toHaveBeenCalledWith(100)
    })
  })

  describe('participant checkbox interaction', () => {
    it('adds a participant when their checkbox is checked', () => {
      const setSelectedParticipants = jest.fn()
      renderExpenseList({
        selectedParticipants: [10],
        setSelectedParticipants,
      })

      const bobCheckbox = screen.getByLabelText(/Bob/)
      fireEvent.click(bobCheckbox)

      expect(setSelectedParticipants).toHaveBeenCalledWith([10, 11])
    })

    it('removes a participant when their checkbox is unchecked', () => {
      const setSelectedParticipants = jest.fn()
      renderExpenseList({
        selectedPersonId: 10,
        selectedParticipants: [10, 11],
        setSelectedParticipants,
      })

      // Bob (id: 11) is not the paymaster, so can be unchecked
      const bobCheckbox = screen.getByLabelText(/Bob/)
      fireEvent.click(bobCheckbox)

      expect(setSelectedParticipants).toHaveBeenCalledWith([10])
    })

    it('disables the checkbox for the paymaster', () => {
      renderExpenseList({
        selectedPersonId: 10, // Alice is paymaster
        selectedParticipants: [10, 11],
      })

      // Alice's checkbox should be disabled since she's the paymaster
      const aliceCheckbox = screen.getByLabelText(/Alice \(paying\)/)
      expect(aliceCheckbox).toBeDisabled()
    })
  })
})
