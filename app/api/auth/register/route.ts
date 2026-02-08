import type { NextRequest} from 'next/server'
import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import type { RegisterResponseBody } from '@/types'
import { createUser, getUserByUsername } from '@/lib/db/users'
import { createSession } from '@/lib/db/sessions'
import { createSerializedRegisterSessionTokenCookie } from '@/lib/auth/session'
import { verifyCsrfToken } from '@/lib/auth/csrf'
import { hashPassword } from '@/lib/auth/password'

type RegisterRequestBody = {
  username: string
  password: string
  csrfToken: string
}

export async function POST(request: NextRequest) {
  const body: RegisterRequestBody = await request.json()

  if (
    typeof body.username !== 'string' ||
    !body.username ||
    typeof body.password !== 'string' ||
    !body.password ||
    typeof body.csrfToken !== 'string' ||
    !body.csrfToken
  ) {
    return NextResponse.json(
      {
        errors: [{ message: 'Username,Password or CSRF token not provided' }],
      },
      { status: 400 },
    )
  }

  // Verify csrf token
  const csrfTokenMatches = verifyCsrfToken(body.csrfToken)

  if (!csrfTokenMatches) {
    return NextResponse.json(
      {
        errors: [{ message: 'Invalid CSRF token' }],
      },
      { status: 403 },
    )
  }

  // If there is already a user matching the username, return error message
  if (await getUserByUsername(body.username)) {
    return NextResponse.json(
      {
        errors: [
          {
            message: 'Username already taken',
          },
        ],
      },
      { status: 409 },
    )
  }

  const passwordHash = await hashPassword(body.password)

  // Create user in DB
  const user = await createUser(body.username, passwordHash)

  // 1. Create a unique token
  const token = crypto.randomBytes(64).toString('base64')
  const session = await createSession(token, user.id)

  // 2. Serialize the cookie
  const serializedCookie = await createSerializedRegisterSessionTokenCookie(
    session.token,
  )

  // Return response with cookie
  const response: RegisterResponseBody = { user: user }

  return NextResponse.json(response, {
    status: 201,
    headers: {
      'Set-Cookie': serializedCookie,
    },
  })
}
