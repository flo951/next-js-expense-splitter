type ExpenseForBalance = {
  paymaster: number
  cost: number | null
  participantIds: number[]
}

type PersonForBalance = {
  id: number
  name: string
}

export type PersonBalance = {
  personId: number
  personName: string
  balance: number
}

/**
 * Calculates each person's net balance from a list of expenses.
 *
 * Costs are stored in cents (integers). Balances are returned in euros.
 * Positive balance = person should receive money.
 * Negative balance = person owes money.
 */
export function calculatePersonBalances(
  peopleList: PersonForBalance[],
  expenseList: ExpenseForBalance[],
): PersonBalance[] {
  return peopleList.map((person) => {
    const totalPaid = expenseList
      .filter((expense) => expense.paymaster === person.id)
      .reduce((sum, expense) => sum + (expense.cost ?? 0) / 100, 0)

    const totalOwed = expenseList
      .filter((expense) => expense.participantIds.includes(person.id))
      .reduce((sum, expense) => {
        const shareAmount =
          (expense.cost ?? 0) / 100 / expense.participantIds.length
        return sum + shareAmount
      }, 0)

    const balance = Math.round((totalPaid - totalOwed) * 100) / 100

    return {
      personId: person.id,
      personName: person.name,
      balance,
    }
  })
}
