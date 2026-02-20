import type { NextApiRequest, NextApiResponse } from 'next'

jest.mock('../../../util/database', () => ({
  getUserByValidSessionToken: jest.fn(),
  createExpense: jest.fn(),
  deleteExpenseById: jest.fn(),
}))

import expenseHandler from '../expense'
import {
  getUserByValidSessionToken,
  createExpense,
  deleteExpenseById,
} from '../../../util/database'

function createMockRes() {
  const res: Partial<NextApiResponse> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.setHeader = jest.fn().mockReturnValue(res)
  return res as NextApiResponse
}

function createReq(
  method: string,
  body: Record<string, unknown>,
  sessionToken?: string,
) {
  return {
    method,
    body,
    cookies: { sessionToken: sessionToken ?? 'valid-token' },
  } as unknown as NextApiRequest
}

const mockUser = { id: 1, username: 'alice' }

const mockExpense = {
  id: 10,
  expensename: 'Dinner',
  cost: 9000,
  event_id: 5,
  paymaster: 2,
  expense_participants: [{ person_id: 2 }, { person_id: 3 }],
  participantIds: [2, 3],
}

describe('/api/expense', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(getUserByValidSessionToken).mockResolvedValue(mockUser)
    jest.mocked(createExpense).mockResolvedValue(mockExpense)
    jest.mocked(deleteExpenseById).mockResolvedValue({
      id: 10,
      expensename: 'Dinner',
      cost: 9000,
      event_id: 5,
      paymaster: 2,
    })
  })

  describe('authentication', () => {
    it('returns 401 when session token is absent', async () => {
      jest.mocked(getUserByValidSessionToken).mockResolvedValue(undefined)
      const req = createReq('POST', {}, undefined)
      const res = createMockRes()

      await expenseHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ message: 'Unothorized' }],
      })
    })

    it('returns 401 when session token is invalid', async () => {
      jest.mocked(getUserByValidSessionToken).mockResolvedValue(undefined)
      const req = createReq('POST', {}, 'expired-token')
      const res = createMockRes()

      await expenseHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })
  })

  describe('POST — create expense', () => {
    const validBody = {
      expensename: 'Dinner',
      cost: 9000,
      eventId: 5,
      paymaster: 2,
      participantIds: [2, 3],
    }

    it('returns 400 when expensename is empty', async () => {
      const req = createReq('POST', { ...validBody, expensename: '' })
      const res = createMockRes()

      await expenseHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 when cost is zero', async () => {
      const req = createReq('POST', { ...validBody, cost: 0 })
      const res = createMockRes()

      await expenseHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 when paymaster is 0 (unselected)', async () => {
      const req = createReq('POST', { ...validBody, paymaster: 0 })
      const res = createMockRes()

      await expenseHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        errors: [
          {
            message:
              'Expense Name not provided, cost value invalid, paymaster id is 0, or no participants selected',
          },
        ],
      })
    })

    it('returns 400 when participantIds is empty', async () => {
      const req = createReq('POST', { ...validBody, participantIds: [] })
      const res = createMockRes()

      await expenseHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 201 with created expense on valid request', async () => {
      const req = createReq('POST', validBody)
      const res = createMockRes()

      await expenseHandler(req, res)

      expect(createExpense).toHaveBeenCalledWith(
        'Dinner',
        9000,
        5,
        2,
        [2, 3],
      )
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({ expense: mockExpense })
    })
  })

  describe('DELETE — remove expense', () => {
    it('returns 400 when expenseId is missing', async () => {
      const req = createReq('DELETE', {})
      const res = createMockRes()

      await expenseHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ message: 'expense not provided' }],
      })
    })

    it('returns 400 when expenseId is 0', async () => {
      const req = createReq('DELETE', { expenseId: 0 })
      const res = createMockRes()

      await expenseHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 404 when expense is not found', async () => {
      jest.mocked(deleteExpenseById).mockResolvedValue(null as never)
      const req = createReq('DELETE', { expenseId: 99 })
      const res = createMockRes()

      await expenseHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('returns 201 with deleted expense on success', async () => {
      const req = createReq('DELETE', { expenseId: 10 })
      const res = createMockRes()

      await expenseHandler(req, res)

      expect(deleteExpenseById).toHaveBeenCalledWith(10, 1)
      expect(res.status).toHaveBeenCalledWith(201)
    })
  })

  it('returns 405 for unsupported methods', async () => {
    const req = createReq('GET', {})
    const res = createMockRes()

    await expenseHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Method not supported' }],
    })
  })
})
