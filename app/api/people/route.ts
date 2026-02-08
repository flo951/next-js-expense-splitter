import type { NextRequest} from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { User } from '@/types'
import { getUserByValidSessionToken } from '@/lib/db/users'
import { createPerson } from '@/lib/db/people'
import type { people } from '@prisma/client'

export type CreatePersonResponseBody =
  | { errors: { message: string }[] }
  | { person: people }

type CreatePersonRequestBody = {
  name: string
  user: User
  eventId: number
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

  const body: CreatePersonRequestBody = await request.json()

  if (
    typeof body.name !== 'string' ||
    !body.name ||
    typeof body.user.username !== 'string' ||
    !body.user.username
  ) {
    return NextResponse.json(
      {
        errors: [{ message: 'Name not provided' }],
      },
      { status: 400 },
    )
  }

  // Create person in DB
  const person = await createPerson(body.name, body.eventId, body.user.id)

  return NextResponse.json({ person: person }, { status: 201 })
}
