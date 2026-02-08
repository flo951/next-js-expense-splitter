import type { NextRequest} from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserByValidSessionToken } from '@/lib/db/users'
import { deleteExpenseById } from '@/lib/db/expenses'
import type { expenses } from '@prisma/client'

export type DeleteExpenseResponseBody =
  | { errors: { message: string }[] }
  | { expense: expenses }

type DeleteExpenseRequestBody = {
  expenseId: number
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ expenseId: string }> },
) {
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

  const body: DeleteExpenseRequestBody = await request.json()
  const { expenseId: _expenseId } = await params

  if (typeof body.expenseId !== 'number' || !body.expenseId) {
    return NextResponse.json(
      {
        errors: [{ message: 'expense not provided' }],
      },
      { status: 400 },
    )
  }

  const deletedExpense = await deleteExpenseById(body.expenseId)

  if (!deletedExpense) {
    return NextResponse.json(
      { errors: [{ message: 'Expense not found' }] },
      { status: 404 },
    )
  }

  return NextResponse.json({ expense: deletedExpense }, { status: 200 })
}
