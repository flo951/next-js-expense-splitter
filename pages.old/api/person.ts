import type { NextApiRequest, NextApiResponse } from 'next'
import type { User } from '@/types'
import { getUserByValidSessionToken } from '@/lib/db/users'
import {
  createPerson,
  deletePersonById,
} from '@/lib/db/people'
import type { people } from '@prisma/client'

export type CreatePersonResponseBody = {
  errors?: { message: string }[]
  person?: people
  personId?: number
  user?: User
}

export type DeletePersonResponseBody =
  | { person: people }
  | { errors: { message: string }[] }

export type CreatePersonRequestBody = {
  name: string
  user: User
  personId: number
  eventId: number
}

type CreatePersonNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: CreatePersonRequestBody
}

export default async function createPersonHandler(
  request: CreatePersonNextApiRequest,
  response: NextApiResponse<CreatePersonResponseBody>,
) {
  // Check if user is logged in and allowed to create or delete
  const user = await getUserByValidSessionToken(request.cookies.sessionToken)

  if (!user) {
    response.status(401).json({
      errors: [{ message: 'Unothorized' }],
    })
    return
  }
  if (request.method === 'POST') {
    if (
      typeof request.body.name !== 'string' ||
      !request.body.name ||
      typeof request.body.user.username !== 'string' ||
      !request.body.user.username
    ) {
      // 400 bad request
      response.status(400).json({
        errors: [{ message: 'Name not provided' }],
      })
      return // Important, prevents error for multiple requests
    }

    // Create person in DB

    const person = await createPerson(
      request.body.name,
      request.body.eventId,
      request.body.user.id,
    )

    response.status(201).json({ person: person })
    return
  } else if (request.method === 'DELETE') {
    if (
      typeof request.body.personId !== 'number' ||
      !request.body.personId ||
      typeof request.body.user.username !== 'string' ||
      !request.body.user.username
    ) {
      // 400 bad request
      response.status(400).json({
        errors: [{ message: 'id or name not provided' }],
      })
      return // Important, prevents error for multiple requests
    }
    // if the method is DELETE delete the person matching the id and user_id
    const deletedGuest = await deletePersonById(
      request.body.personId,
      request.body.user.id,
    )

    if (!deletedGuest) {
      response.status(404).json({ errors: [{ message: 'Name not provided' }] })
      return
    }
    response.status(201).json({ person: deletedGuest })
    return
  }
  response.status(405).json({ errors: [{ message: 'Method not supported' }] })
}
