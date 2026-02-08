'use client'

import { UserProvider, useUser } from '@/hooks/useUser'
import Header from '@/components/layout/Header'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useUser()

  return (
    <>
      <Header userObject={user} />
      <main>{children}</main>
    </>
  )
}

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserProvider>
      <LayoutContent>{children}</LayoutContent>
    </UserProvider>
  )
}
