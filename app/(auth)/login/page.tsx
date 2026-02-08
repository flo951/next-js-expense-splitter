/* @jsxImportSource react */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createCsrfToken } from '@/lib/auth/csrf'
import { getValidSessionByToken } from '@/lib/db/sessions'
import LoginForm from './LoginForm'

export const metadata = {
  title: 'Login | Splitify',
  description: 'Login to your Splitify account',
}

export default async function LoginPage() {
  // Redirect if already logged in
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value
  const session = await getValidSessionByToken(sessionToken)

  if (session) {
    redirect('/overview')
  }

  // Generate CSRF token
  const csrfToken = createCsrfToken()

  return (
    <main>
      <h1>Login</h1>
      <LoginForm csrfToken={csrfToken} />
    </main>
  )
}
