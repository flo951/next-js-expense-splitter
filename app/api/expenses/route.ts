import type { NextRequest} from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserByValidSessionToken } from '@/lib/db/users'
import { createExpense } from '@/lib/db/expenses'
import type { expenses } from '@prisma/client'

type ExpenseWithParticipants = expenses & { participantIds: number[] }

export type CreateExpenseResponseBody =
  | { errors: { message: string }[] }
  | { expense: ExpenseWithParticipants }

type CreateExpenseRequestBody = {
  expensename: string
  cost: number
  eventId: number
  paymaster: number
  participantIds: number[]
}

export async function POST(request: NextRequest) {
  // Check if user is logged in
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value
  const user = await getUserByValidSessionToken(sessionToken)

  if (!user) {
    return NextResponse.json(
      {
        errors: [{ message: 'Unauthorized' }],
      },
      { status: 401 },
    )
  }

  const body: CreateExpenseRequestBody = await request.json()

  if (
    typeof body.expensename !== 'string' ||
    !body.expensename ||
    typeof body.cost !== 'number' ||
    !body.cost ||
    typeof body.paymaster !== 'number' ||
    body.paymaster === 0 ||
    !Array.isArray(body.participantIds) ||
    body.participantIds.length === 0
  ) {
    return NextResponse.json(
      {
        errors: [
          {
            message:
              'Expense Name not provided, cost value invalid, paymaster id is 0, or no participants selected',
          },
        ],
      },
      { status: 400 },
    )
  }

  const expense = await createExpense(
    body.expensename,
    body.cost,
    body.eventId,
    body.paymaster,
    body.participantIds,
  )

  return NextResponse.json({ expense: expense }, { status: 201 })
}
