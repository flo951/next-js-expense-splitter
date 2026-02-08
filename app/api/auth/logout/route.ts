import type { NextRequest} from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSessionByToken } from '@/lib/db/sessions'
import { serialize } from 'cookie'

export async function POST(_request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('sessionToken')?.value

  if (token) {
    await deleteSessionByToken(token)
  }

  // Clear the cookie
  const serializedCookie = serialize('sessionToken', '', {
    maxAge: -1,
    path: '/',
  })

  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        'Set-Cookie': serializedCookie,
      },
    },
  )
}
