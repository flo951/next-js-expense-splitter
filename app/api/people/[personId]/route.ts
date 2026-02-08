import type { NextRequest} from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { User } from '@/types'
import { getUserByValidSessionToken } from '@/lib/db/users'
import { deletePersonById } from '@/lib/db/people'
import type { people } from '@prisma/client'

export type DeletePersonResponseBody =
  | { errors: { message: string }[] }
  | { person: people }

type DeletePersonRequestBody = {
  personId: number
  user: User
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ personId: string }> },
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

  const body: DeletePersonRequestBody = await request.json()
  const { personId } = await params

  if (
    typeof body.personId !== 'number' ||
    !body.personId ||
    typeof body.user.username !== 'string' ||
    !body.user.username
  ) {
    return NextResponse.json(
      {
        errors: [{ message: 'id or name not provided' }],
      },
      { status: 400 },
    )
  }

  const deletedPerson = await deletePersonById(body.personId, body.user.id)

  if (!deletedPerson) {
    return NextResponse.json(
      { errors: [{ message: 'Person not found' }] },
      { status: 404 },
    )
  }

  return NextResponse.json({ person: deletedPerson }, { status: 200 })
}
