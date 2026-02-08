/* @jsxImportSource react */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserByValidSessionToken } from '@/lib/db/users'
import { getAllEventsWhereIdMatches } from '@/lib/db/events'
import CreateEventPageContent from '@/components/events/CreateEventPageContent'

export const metadata = {
  title: 'Create Event | Splitify',
  description: 'Create a new event',
}

export default async function CreateEventPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value
  const user = await getUserByValidSessionToken(sessionToken)

  if (!user) {
    redirect('/login')
  }

  const eventsInDb = await getAllEventsWhereIdMatches(user.id)

  return <CreateEventPageContent initialEvents={eventsInDb || []} user={user} />
}
