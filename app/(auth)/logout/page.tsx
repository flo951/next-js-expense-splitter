/* @jsxImportSource react */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { deleteSessionByToken } from '@/lib/db/sessions'

export const metadata = {
  title: 'Logout | Splitify',
}

export default async function LogoutPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sessionToken')?.value

  if (token) {
    await deleteSessionByToken(token)
  }

  // Clear cookie and redirect
  redirect('/')
}
