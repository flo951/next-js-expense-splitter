import { calculatePersonBalances } from '../expenseBalances'

const alice = { id: 1, name: 'Alice' }
const bob = { id: 2, name: 'Bob' }
const charlie = { id: 3, name: 'Charlie' }

describe('calculatePersonBalances', () => {
  it('should return empty array when there are no people', () => {
    expect(calculatePersonBalances([], [])).toEqual([])
  })

  it('should return zero balances when there are no expenses', () => {
    const result = calculatePersonBalances([alice, bob], [])
    expect(result).toHaveLength(2)
    expect(result[0]!.balance).toBe(0)
    expect(result[1]!.balance).toBe(0)
  })

  it('should include personId and personName in each result', () => {
    const result = calculatePersonBalances([alice], [])
    expect(result[0]).toEqual({ personId: 1, personName: 'Alice', balance: 0 })
  })

  it('should convert cost from cents to euros', () => {
    // Alice pays 9000 cents (90€) split with Bob
    const result = calculatePersonBalances(
      [alice, bob],
      [{ paymaster: 1, cost: 9000, participantIds: [1, 2] }],
    )
    expect(result.find((p) => p.personId === 1)?.balance).toBe(45)
    expect(result.find((p) => p.personId === 2)?.balance).toBe(-45)
  })

  it("should subtract the paymaster's own share from what they paid", () => {
    // Alice pays 30000 cents (300€) split three ways
    // Alice net: 300 - 100 = +200
    const result = calculatePersonBalances(
      [alice, bob, charlie],
      [{ paymaster: 1, cost: 30000, participantIds: [1, 2, 3] }],
    )
    expect(result.find((p) => p.personId === 1)?.balance).toBeCloseTo(200)
    expect(result.find((p) => p.personId === 2)?.balance).toBeCloseTo(-100)
    expect(result.find((p) => p.personId === 3)?.balance).toBeCloseTo(-100)
  })

  it('should accumulate balances across multiple expenses', () => {
    // Expense 1: Alice pays 9000 cents (90€), split Alice+Bob
    //   Alice +45, Bob -45
    // Expense 2: Bob pays 30000 cents (300€), split Alice+Bob+Charlie
    //   Bob +200, Alice -100, Charlie -100
    // Final: Alice=-55, Bob=+155, Charlie=-100
    const result = calculatePersonBalances(
      [alice, bob, charlie],
      [
        { paymaster: 1, cost: 9000, participantIds: [1, 2] },
        { paymaster: 2, cost: 30000, participantIds: [1, 2, 3] },
      ],
    )
    expect(result.find((p) => p.personId === 1)?.balance).toBeCloseTo(-55)
    expect(result.find((p) => p.personId === 2)?.balance).toBeCloseTo(155)
    expect(result.find((p) => p.personId === 3)?.balance).toBeCloseTo(-100)
  })

  it('should treat null cost as zero', () => {
    const result = calculatePersonBalances(
      [alice, bob],
      [{ paymaster: 1, cost: null, participantIds: [1, 2] }],
    )
    expect(result.find((p) => p.personId === 1)?.balance).toBe(0)
    expect(result.find((p) => p.personId === 2)?.balance).toBe(0)
  })

  it('should round balance to 2 decimal places', () => {
    // 10000 cents (100€) split 3 ways — 33.333...€ each
    // Alice paid 100, owes 33.33... → balance rounds to 66.67
    // Bob and Charlie owe 33.33... → balance rounds to -33.33
    const result = calculatePersonBalances(
      [alice, bob, charlie],
      [{ paymaster: 1, cost: 10000, participantIds: [1, 2, 3] }],
    )
    expect(result.find((p) => p.personId === 1)?.balance).toBe(66.67)
    expect(result.find((p) => p.personId === 2)?.balance).toBe(-33.33)
    expect(result.find((p) => p.personId === 3)?.balance).toBe(-33.33)
  })

  it('should give zero balance to a person not in any expense', () => {
    const result = calculatePersonBalances(
      [alice, bob, charlie],
      [{ paymaster: 1, cost: 10000, participantIds: [1, 2] }],
    )
    expect(result.find((p) => p.personId === 3)?.balance).toBe(0)
  })

  it('should give zero balance to a person who paid exactly what they owe', () => {
    // Alice and Bob each pay 5000 cents (50€) and split both with each other
    // Each paid 50, each owes 50 → net zero
    const result = calculatePersonBalances(
      [alice, bob],
      [
        { paymaster: 1, cost: 5000, participantIds: [1, 2] },
        { paymaster: 2, cost: 5000, participantIds: [1, 2] },
      ],
    )
    expect(result.find((p) => p.personId === 1)?.balance).toBe(0)
    expect(result.find((p) => p.personId === 2)?.balance).toBe(0)
  })

  it('should produce balances that sum to zero across all participants', () => {
    const result = calculatePersonBalances(
      [alice, bob, charlie],
      [
        { paymaster: 1, cost: 9000, participantIds: [1, 2] },
        { paymaster: 2, cost: 30000, participantIds: [1, 2, 3] },
        { paymaster: 3, cost: 4500, participantIds: [1, 2, 3] },
      ],
    )
    const totalBalance = result.reduce((sum, p) => sum + p.balance, 0)
    expect(Math.abs(totalBalance)).toBeLessThan(0.02)
  })
})
