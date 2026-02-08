/* @jsxImportSource react */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserByValidSessionToken } from '@/lib/db/users'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value
  const user = await getUserByValidSessionToken(sessionToken)

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
