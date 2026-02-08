/* @jsxImportSource react */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createCsrfToken } from '@/lib/auth/csrf'
import { getValidSessionByToken } from '@/lib/db/sessions'
import RegisterForm from './RegisterForm'

export const metadata = {
  title: 'Register | Splitify',
  description: 'Create a new Splitify account',
}

export default async function RegisterPage() {
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
      <h1>Register</h1>
      <RegisterForm csrfToken={csrfToken} />
    </main>
  )
}
