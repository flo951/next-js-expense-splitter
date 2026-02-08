// Database entity types extracted from util/database.ts

export type User = {
  id: number
  username: string
}

export type UserWithPasswordHash = User & { passwordHash: string }

export type Person = {
  id: number
  name: string
  eventId?: number
  userId?: number
  person?: string
}

export type Event = {
  id: number
  eventname: string
  user_id: number | null
  imageurl: string | null
}

export type Expense = {
  id: number
  expensename: string
  personExpense?: number
  cost: number
  eventId: number
  paymaster: number
}

export type Session = {
  id: number
  token: string
  user_id: number
  expiry_timestamp: Date
}
