import type {
  Transaction,
  Balances} from '../splitPayments'
import {
  calculateSettlements,
  splitPayments,
  formatTransaction
} from '../splitPayments'

describe('calculateSettlements', () => {
  describe('basic scenarios', () => {
    it('should return empty array when less than 2 people', () => {
      expect(calculateSettlements({})).toEqual([])
      expect(calculateSettlements({ Alice: 100 })).toEqual([])
    })

    it('should handle two people with simple debt', () => {
      const balances: Balances = {
        Alice: -50,
        Bob: 50,
      }

      const result = calculateSettlements(balances)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ from: 'Alice', to: 'Bob', amount: 50 })
    })

    it('should handle three people where one owes two others', () => {
      const balances: Balances = {
        Alice: 30,
        Bob: 20,
        Charlie: -50,
      }

      const result = calculateSettlements(balances)

      expect(result).toHaveLength(2)
      // Charlie owes the most, should pay Alice (who is owed most) first
      expect(result[0]).toEqual({ from: 'Charlie', to: 'Alice', amount: 30 })
      expect(result[1]).toEqual({ from: 'Charlie', to: 'Bob', amount: 20 })
    })

    it('should handle three people where two owe one', () => {
      const balances: Balances = {
        Alice: -30,
        Bob: -20,
        Charlie: 50,
      }

      const result = calculateSettlements(balances)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ from: 'Alice', to: 'Charlie', amount: 30 })
      expect(result[1]).toEqual({ from: 'Bob', to: 'Charlie', amount: 20 })
    })
  })

  describe('complex scenarios', () => {
    it('should handle the original test case (4 people, 1 debtor)', () => {
      const balances: Balances = {
        Antje: 197.75,
        Flo: 306.75,
        Jose: 97.75,
        Tobi: -602.25,
      }

      const result = calculateSettlements(balances)

      expect(result).toHaveLength(3)
      // Tobi pays everyone else
      const totalPaid = result.reduce((sum, t) => sum + t.amount, 0)
      expect(totalPaid).toBeCloseTo(602.25, 2)
      expect(result.every((t) => t.from === 'Tobi')).toBe(true)
    })

    it('should handle expense splitting scenario (Flo, Miki, Denise)', () => {
      // Scenario from user:
      // Expense 1: 90€ by Flo, split by Flo+Denise -> Flo: +45, Denise: -45
      // Expense 2: 300€ by Miki, split by all 3 -> Miki: +200, Flo: -100, Denise: -100
      // Final: Flo: -55, Miki: +200, Denise: -145
      const balances: Balances = {
        Flo: -55,
        Miki: 200,
        Denise: -145,
      }

      const result = calculateSettlements(balances)

      expect(result).toHaveLength(2)
      // Total paid should equal total received
      const totalPaid = result
        .filter((t) => t.from === 'Denise' || t.from === 'Flo')
        .reduce((sum, t) => sum + t.amount, 0)
      expect(totalPaid).toBeCloseTo(200, 2)
    })

    it('should minimize number of transactions', () => {
      // A owes 100, B owes 100, C is owed 100, D is owed 100
      // Optimal: 2 transactions (A->C, B->D) not 4
      const balances: Balances = {
        A: -100,
        B: -100,
        C: 100,
        D: 100,
      }

      const result = calculateSettlements(balances)

      expect(result).toHaveLength(2)
    })

    it('should handle chain of debts', () => {
      // A: -100, B: 0, C: 100 -> A pays C directly
      const balances: Balances = {
        A: -100,
        B: 0,
        C: 100,
      }

      const result = calculateSettlements(balances)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ from: 'A', to: 'C', amount: 100 })
    })
  })

  describe('edge cases', () => {
    it('should handle all zero balances', () => {
      const balances: Balances = {
        Alice: 0,
        Bob: 0,
        Charlie: 0,
      }

      const result = calculateSettlements(balances)

      expect(result).toHaveLength(0)
    })

    it('should handle floating point precision', () => {
      const balances: Balances = {
        Alice: -33.33,
        Bob: -33.33,
        Charlie: 66.66,
      }

      const result = calculateSettlements(balances)

      // Should handle small floating point differences
      expect(result.length).toBeGreaterThanOrEqual(1)
      const totalPaid = result.reduce((sum, t) => sum + t.amount, 0)
      expect(totalPaid).toBeCloseTo(66.66, 1)
    })

    it('should handle very small amounts', () => {
      const balances: Balances = {
        Alice: -0.01,
        Bob: 0.01,
      }

      const result = calculateSettlements(balances)

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(0.01)
    })

    it('should handle large amounts', () => {
      const balances: Balances = {
        Alice: -10000,
        Bob: 10000,
      }

      const result = calculateSettlements(balances)

      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(10000)
    })
  })

  describe('balance verification', () => {
    it('should result in zero balance for all parties after settlements', () => {
      const balances: Balances = {
        Alice: -150,
        Bob: 75,
        Charlie: -25,
        Diana: 100,
      }

      const result = calculateSettlements(balances)

      // Apply all transactions to original balances
      const finalBalances = { ...balances }
      for (const transaction of result) {
        finalBalances[transaction.from] += transaction.amount
        finalBalances[transaction.to] -= transaction.amount
      }

      // All balances should be approximately zero
      for (const balance of Object.values(finalBalances)) {
        expect(Math.abs(balance)).toBeLessThan(0.01)
      }
    })
  })
})

describe('formatTransaction', () => {
  it('should format transaction correctly', () => {
    const transaction: Transaction = {
      from: 'Alice',
      to: 'Bob',
      amount: 50,
    }

    expect(formatTransaction(transaction)).toBe('Alice owes Bob 50.00€')
  })

  it('should format decimal amounts with 2 decimal places', () => {
    const transaction: Transaction = {
      from: 'Alice',
      to: 'Bob',
      amount: 33.333,
    }

    expect(formatTransaction(transaction)).toBe('Alice owes Bob 33.33€')
  })

  it('should format whole numbers with decimal places', () => {
    const transaction: Transaction = {
      from: 'Alice',
      to: 'Bob',
      amount: 100,
    }

    expect(formatTransaction(transaction)).toBe('Alice owes Bob 100.00€')
  })
})

describe('splitPayments (legacy API)', () => {
  it('should return formatted strings with leading space for backward compatibility', () => {
    const balances: Balances = {
      Alice: -50,
      Bob: 50,
    }

    const result = splitPayments(balances)

    expect(result).toHaveLength(1)
    expect(result[0]).toBe(' Alice owes Bob 50.00€')
  })

  it('should match original test case output format', () => {
    const balances: Balances = {
      Antje: 197.75,
      Flo: 306.75,
      Jose: 97.75,
      Tobi: -602.25,
    }

    const result = splitPayments(balances)

    expect(result).toHaveLength(3)
    // Verify format matches legacy output
    expect(result[0]).toMatch(/^ Tobi owes \w+ \d+\.\d{2}€$/)
  })
})
