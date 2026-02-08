'use client'

import type { ReactNode } from 'react'
import type { User } from '@/types'
import Header from './header'

type RootLayoutProps = {
  children: ReactNode
  userObject?: User
}

export default function RootLayout({ children, userObject }: RootLayoutProps) {
  return (
    <>
      <Header userObject={userObject} />
      <main>{children}</main>
    </>
  )
}
