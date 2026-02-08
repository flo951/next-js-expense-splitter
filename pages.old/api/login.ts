import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'node:crypto'
import type { User } from '@/types'
import {
  getUserWithPasswordHashByUsername,
} from '@/lib/db/users'
import { createSession } from '@/lib/db/sessions'
import { createSerializedRegisterSessionTokenCookie } from '@/lib/auth/session'
import { verifyCsrfToken } from '@/lib/auth/csrf'
import { verifyPassword } from '@/lib/auth/password'

type LoginRequestBody = {
  username: string
  password: string
  csrfToken: string
}

type LoginNextApiRequest = Omit<NextApiRequest, 'body'> & {
  body: LoginRequestBody
}

export type LoginResponseBody =
  | { errors: { message: string }[] }
  | { user: Pick<User, 'id'> }

export default async function loginHandler(
  request: LoginNextApiRequest,
  response: NextApiResponse<LoginResponseBody>,
) {
  if (request.method === 'POST') {
    if (
      typeof request.body.username !== 'string' ||
      !request.body.username ||
      typeof request.body.password !== 'string' ||
      !request.body.password ||
      typeof request.body.csrfToken !== 'string' ||
      !request.body.csrfToken
    ) {
      response.status(400).json({
        errors: [
          {
            message: 'Username, password or CSRF Token not provided',
          },
        ],
      })
      return // Important: will prevent "Headers already sent" error
    }

    // Verify csrf token
    const csrfTokenMatches = verifyCsrfToken(request.body.csrfToken)

    if (!csrfTokenMatches) {
      response.status(403).json({
        errors: [{ message: 'Invalid CSRF token' }],
      })
      return
    }

    const userWithPasswordHash = await getUserWithPasswordHashByUsername(
      request.body.username,
    )

    if (!userWithPasswordHash) {
      response.status(401).json({
        errors: [{ message: "Username or Password doesn't exist" }],
      })
      return
    }

    const passwordMatches = await verifyPassword(
      request.body.password,
      userWithPasswordHash.password_hash,
    )

    if (!passwordMatches) {
      response.status(401).json({
        errors: [{ message: "Username or Password doesn't exist" }],
      })
      return
    }

    // 1. Create a unique token
    const sessionToken = crypto.randomBytes(64).toString('base64')
    const session = await createSession(sessionToken, userWithPasswordHash.id)

    // 2. Serialize the cookie
    const serializedCookie = await createSerializedRegisterSessionTokenCookie(
      session.token,
    )
    // 3. Add the cookie to the header response

    // status code 201 means something was created
    response
      .status(201)
      .setHeader('Set-Cookie', serializedCookie)
      .json({ user: { id: userWithPasswordHash.id } })
    return
  }

  response.status(405).json({ errors: [{ message: 'Method not supported' }] })
}
