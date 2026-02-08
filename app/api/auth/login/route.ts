import type { NextRequest} from 'next/server'
import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import type { LoginResponseBody } from '@/types'
import { getUserWithPasswordHashByUsername } from '@/lib/db/users'
import { createSession } from '@/lib/db/sessions'
import { createSerializedRegisterSessionTokenCookie } from '@/lib/auth/session'
import { verifyCsrfToken } from '@/lib/auth/csrf'
import { verifyPassword } from '@/lib/auth/password'

type LoginRequestBody = {
  username: string
  password: string
  csrfToken: string
}

export async function POST(request: NextRequest) {
  const body: LoginRequestBody = await request.json()

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
        errors: [
          {
            message: 'Username, password or CSRF Token not provided',
          },
        ],
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

  const userWithPasswordHash = await getUserWithPasswordHashByUsername(
    body.username,
  )

  if (!userWithPasswordHash) {
    return NextResponse.json(
      {
        errors: [{ message: "Username or Password doesn't exist" }],
      },
      { status: 401 },
    )
  }

  const passwordMatches = await verifyPassword(
    body.password,
    userWithPasswordHash.password_hash,
  )

  if (!passwordMatches) {
    return NextResponse.json(
      {
        errors: [{ message: "Username or Password doesn't exist" }],
      },
      { status: 401 },
    )
  }

  // 1. Create a unique token
  const sessionToken = crypto.randomBytes(64).toString('base64')
  const session = await createSession(sessionToken, userWithPasswordHash.id)

  // 2. Serialize the cookie
  const serializedCookie = await createSerializedRegisterSessionTokenCookie(
    session.token,
  )

  // 3. Return response with cookie
  const response: LoginResponseBody = { user: { id: userWithPasswordHash.id } }

  return NextResponse.json(response, {
    status: 201,
    headers: {
      'Set-Cookie': serializedCookie,
    },
  })
}
