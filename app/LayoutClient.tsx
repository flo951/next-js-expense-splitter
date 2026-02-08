'use client'

import { Global, css } from '@emotion/react'
import Header from '@/components/layout/Header'
import { useState, useEffect } from 'react'
import type { User } from '@/types'

const globalStyles = css`
  html,
  body {
    margin: 0;
    box-sizing: border-box;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | undefined>(undefined)

  useEffect(() => {
    // Fetch user session
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if ('user' in data) {
          setUser(data.user)
        }
      })
      .catch(() => {
        // Silently fail
      })
  }, [])

  return (
    <>
      <Global styles={globalStyles} />
      <Header userObject={user} />
      <main>{children}</main>
    </>
  )
}
