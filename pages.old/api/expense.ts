import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserByValidSessionToken } from '@/lib/db/users'
import {
  createExpense,
  deleteExpenseById,
} from '@/lib/db/expenses'
import type { expenses } from '@prisma/client'

type ExpenseWithParticipants = expenses & { participantIds: number[] }

export type CreateExpenseResponseBody =
  | { errors: { message: string }[] }
  | { expense: ExpenseWithParticipants }

export type DeleteExpenseResponseBody = {
  expense: expenses
  errors?: { message: string }[]
}

type CreateEventRequestBody = {
  expensename: string
  cost: number
  eventId: number
  expenseId?: number
  paymaster: number
  participantIds: number[]
}

type CreateEventNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: CreateEventRequestBody
}

export default async function createEventHandler(
  request: CreateEventNextApiRequest,
  response: NextApiResponse<
    CreateExpenseResponseBody | DeleteExpenseResponseBody
  >,
) {
  // Create event in DB
  // Check if user is logged in and allowed to create or delete
  const user = await getUserByValidSessionToken(request.cookies.sessionToken)

  if (!user) {
    response.status(401).json({
      errors: [{ message: 'Unothorized' }],
    })
    return
  }

  if (request.method === 'POST') {
    if (
      typeof request.body.expensename !== 'string' ||
      !request.body.expensename ||
      typeof request.body.cost !== 'number' ||
      !request.body.cost ||
      typeof request.body.paymaster !== 'number' ||
      request.body.paymaster === 0 ||
      !Array.isArray(request.body.participantIds) ||
      request.body.participantIds.length === 0
    ) {
      // 400 bad request
      response.status(400).json({
        errors: [
          {
            message:
              'Expense Name not provided, cost value invalid, paymaster id is 0, or no participants selected',
          },
        ],
      })
      return // Important, prevents error for multiple requests
    }

    const expense = await createExpense(
      request.body.expensename,
      request.body.cost,
      request.body.eventId,
      request.body.paymaster,
      request.body.participantIds,
    )

    response.status(201).json({ expense: expense })
    return
  } else if (request.method === 'DELETE') {
    if (typeof request.body.expenseId !== 'number' || !request.body.expenseId) {
      // 400 bad request
      response.status(400).json({
        errors: [{ message: 'expense not provided' }],
      })
      return // Important, prevents error for multiple requests
    }

    const deletedExpense = await deleteExpenseById(request.body.expenseId)

    if (!deletedExpense) {
      response.status(404).json({ errors: [{ message: 'Name not provided' }] })
      return
    }
    response.status(201).json({ expense: deletedExpense })
    return
  }

  response.status(405).json({ errors: [{ message: 'Method not supported' }] })
}
