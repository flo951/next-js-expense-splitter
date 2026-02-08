import type { NextRequest} from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUserByValidSessionToken } from '@/lib/db/users'
import type { ProfileResponseBody } from '@/types'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('sessionToken')?.value

  if (!token) {
    return NextResponse.json(
      {
        errors: [
          {
            message: 'No session token passed',
          },
        ],
      },
      { status: 400 },
    )
  }

  const user = await getUserByValidSessionToken(token)

  if (user) {
    const response: ProfileResponseBody = { user: user }
    return NextResponse.json(response, { status: 200 })
  }

  return NextResponse.json(
    {
      errors: [
        {
          message: 'user not found or session token not valid',
        },
      ],
    },
    { status: 404 },
  )
}
