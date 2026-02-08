import type { NextRequest} from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { User } from '@/types'
import { getUserByValidSessionToken } from '@/lib/db/users'
import { createEvent } from '@/lib/db/events'
import type { events } from '@prisma/client'

export type CreateEventResponseBody =
  | { errors: { message: string }[] }
  | { event: events }

type CreateEventRequestBody = {
  eventname: string
  user: User
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

  const body: CreateEventRequestBody = await request.json()

  if (
    typeof body.eventname !== 'string' ||
    !body.eventname ||
    typeof body.user.username !== 'string' ||
    !body.user.username ||
    typeof body.user.id !== 'number' ||
    !body.user.id
  ) {
    return NextResponse.json(
      {
        errors: [{ message: 'Eventname not provided' }],
      },
      { status: 400 },
    )
  }

  // Create event in DB
  const event = await createEvent(body.eventname, body.user.id)

  return NextResponse.json({ event: event }, { status: 201 })
}
