import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import {
  createSession,
  createUser,
  getUserByUsername,
} from '../../util/database'

import { createSerializedRegisterSessionTokenCookie } from '../../util/cookies'
import crypto from 'node:crypto'
import { verifyCsrfToken } from '../../util/auth'

type RegisterRequestBody = {
  username: string
  password: string
  csrfToken: string
}

type RegisterNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: RegisterRequestBody
}

export type RegisterResponseBody =
  | { errors: { message: string }[] }
  | Record<string, never>

export default async function registerHandler(
  request: RegisterNextApiRequest,
  response: NextApiResponse<RegisterResponseBody>,
) {
  if (request.method === 'POST') {
    if (
      !request.body.username ||
      !request.body.password ||
      !request.body.csrfToken
    ) {
      // 400 bad request
      response.status(400).json({
        errors: [{ message: 'Username,Password or CSRF token not provided' }],
      })
      return // Important, prevents error for multiple requests
    }

    // Verify csrf token
    const csrfTokenMatches = verifyCsrfToken(request.body.csrfToken)

    if (!csrfTokenMatches) {
      response.status(403).json({
        errors: [{ message: 'Invalid CSRF token' }],
      })
      return
    }
    // If there is already a user matching the username,return error message

    if (await getUserByUsername(request.body.username)) {
      response.status(409).json({
        errors: [
          {
            message: 'Username already taken',
          },
        ],
      })
      return // Important: will prevent "Headers already sent" error, if you forget return it will go to the next return
    }
    // 12 is the number of salt rounds, 12^2n
    const passwordHash = await bcrypt.hash(request.body.password, 12)

    // Create user in DB
    const user = await createUser(request.body.username, passwordHash)

    // 1. Create a unique token
    const token = crypto.randomBytes(64).toString('base64')
    const session = await createSession(token, user.id)

    // 2. Serialize the cookie
    const serializedCookie = await createSerializedRegisterSessionTokenCookie(
      session.token,
    )

    // status code 201 means something was created
    response.status(201).setHeader('Set-Cookie', serializedCookie).json({})
    return
  }
  response.status(405).json({ errors: [{ message: 'Method not supported' }] })
}
