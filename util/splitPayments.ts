/**
 * Represents a payment transaction from one person to another
 */
export type Transaction = {
  from: string;
  to: string;
  amount: number;
};

/**
 * Represents a person's balance (positive = should receive, negative = owes)
 */
export type Balances = Record<string, number>;

/**
 * Calculates the minimum number of transactions needed to settle all debts.
 *
 * Uses a two-pointer greedy algorithm:
 * 1. Sort people by balance (most negative to most positive)
 * 2. Match the person who owes the most with the person owed the most
 * 3. Transfer the minimum of what's owed/owed to settle one side
 * 4. Repeat until all balances are zero
 *
 * @param balances - Object mapping person names to their balance
 *                   (positive = should receive money, negative = owes money)
 * @returns Array of transactions to settle all debts
 */
export function calculateSettlements(balances: Balances): Transaction[] {
  const people = Object.keys(balances);

  if (people.length < 2) {
    return [];
  }

  // Create sorted array of [name, balance] pairs, from most negative to most positive
  const sortedBalances = people
    .map((name) => ({ name, balance: balances[name] }))
    .sort((a, b) => a.balance - b.balance);

  // Work with a mutable copy of balances for the algorithm
  const remainingBalances = sortedBalances.map((p) => p.balance);
  const sortedNames = sortedBalances.map((p) => p.name);

  const transactions: Transaction[] = [];

  let debtorIndex = 0; // Points to person who owes the most
  let creditorIndex = people.length - 1; // Points to person owed the most

  while (debtorIndex < creditorIndex) {
    const amountOwed = -remainingBalances[debtorIndex]; // Convert negative to positive
    const amountToReceive = remainingBalances[creditorIndex];

    // Skip if either party has no balance to settle
    if (amountOwed <= 0) {
      debtorIndex++;
      continue;
    }
    if (amountToReceive <= 0) {
      creditorIndex--;
      continue;
    }

    // Transfer the smaller of the two amounts
    const transferAmount = Math.min(amountOwed, amountToReceive);

    // Round to avoid floating point issues
    const roundedAmount = Math.round(transferAmount * 100) / 100;

    if (roundedAmount > 0) {
      transactions.push({
        from: sortedNames[debtorIndex],
        to: sortedNames[creditorIndex],
        amount: roundedAmount,
      });
    }

    // Update balances
    remainingBalances[debtorIndex] += transferAmount;
    remainingBalances[creditorIndex] -= transferAmount;

    // Move pointers if balance is settled (using small epsilon for float comparison)
    if (Math.abs(remainingBalances[debtorIndex]) < 0.01) {
      debtorIndex++;
    }
    if (Math.abs(remainingBalances[creditorIndex]) < 0.01) {
      creditorIndex--;
    }
  }

  return transactions;
}

/**
 * Formats a transaction as a human-readable string
 */
export function formatTransaction(transaction: Transaction): string {
  return `${transaction.from} owes ${transaction.to} ${transaction.amount.toFixed(2)}€`;
}

/**
 * Calculates settlements and returns formatted strings.
 * This is the legacy API for backward compatibility.
 *
 * @param balances - Object mapping person names to their balance
 * @returns Array of formatted strings describing who owes whom
 */
export function splitPayments(balances: Balances): string[] {
  const transactions = calculateSettlements(balances);
  return transactions.map((t) => ` ${formatTransaction(t)}`);
}
