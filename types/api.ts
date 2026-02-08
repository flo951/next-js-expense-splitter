// API request and response types

import type { User } from './database'
import type { events, people, expenses } from '@prisma/client'

// Auth API types
export type LoginRequestBody = {
  username: string
  password: string
  csrfToken: string
}

export type LoginResponseBody =
  | { errors: { message: string }[] }
  | { user: Pick<User, 'id'> }

export type RegisterRequestBody = {
  username: string
  password: string
  csrfToken: string
}

export type RegisterResponseBody =
  | { errors: { message: string }[] }
  | { user: User }

export type ProfileResponseBody =
  | { errors: { message: string }[] }
  | { user: User }

// Event API types
export type CreateEventRequestBody = {
  eventname: string
  user: User
  eventId?: number
  uploadUrl?: string
}

export type CreateEventResponseBody =
  | { errors: { message: string }[] }
  | { event: events }
  | { imageurl: events }

export type DeleteEventResponseBody =
  | { errors: { message: string }[] }
  | { event: events }

// Person API types
export type CreatePersonRequestBody = {
  personName: string
  eventId: number
  user: User
}

export type CreatePersonResponseBody =
  | { errors: { message: string }[] }
  | { person: people }

export type DeletePersonResponseBody =
  | { errors: { message: string }[] }
  | { person: people }

// Expense API types
export type CreateExpenseRequestBody = {
  expenseName: string
  cost: number
  eventId: number
  paymaster: number
  participantIds: number[]
  user: User
}

export type ExpenseWithParticipants = expenses & { participantIds: number[] }

export type CreateExpenseResponseBody =
  | { errors: { message: string }[] }
  | { expense: ExpenseWithParticipants }

export type DeleteExpenseResponseBody =
  | { errors: { message: string }[] }
  | { expense: expenses }

// Generic error response
export type ErrorResponse = {
  errors: { message: string }[]
}

export type Errors = { message: string }[]
