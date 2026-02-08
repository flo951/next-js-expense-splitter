import 'server-only'

import { prisma } from './prisma'

export async function createExpense(
  expenseName: string,
  cost: number,
  eventId: number,
  paymaster: number,
  participantIds: number[],
) {
  // Ensure paymaster is always included in participants
  const uniqueParticipants = [...new Set([paymaster, ...participantIds])]

  const expense = await prisma.expenses.create({
    data: {
      expensename: expenseName,
      cost,
      event_id: eventId,
      paymaster,
      expense_participants: {
        create: uniqueParticipants.map((personId) => ({
          person_id: personId,
        })),
      },
    },
    include: {
      expense_participants: {
        select: {
          person_id: true,
        },
      },
    },
  })

  return {
    ...expense,
    participantIds: expense.expense_participants.map((ep) => ep.person_id),
  }
}

export async function deleteExpenseById(expenseId: number) {
  return await prisma.expenses.delete({
    where: {
      id: expenseId,
    },
  })
}

export async function getAllExpensesWhereIdMatches(eventId: number) {
  const expenses = await prisma.expenses.findMany({
    where: {
      event_id: eventId,
    },
    include: {
      expense_participants: {
        select: {
          person_id: true,
        },
      },
    },
  })

  return expenses.map((expense) => ({
    ...expense,
    participantIds: expense.expense_participants.map((ep) => ep.person_id),
  }))
}
