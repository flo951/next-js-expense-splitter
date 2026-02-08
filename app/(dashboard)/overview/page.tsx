/* @jsxImportSource react */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserByValidSessionToken } from '@/lib/db/users'
import { getAllEventsWhereIdMatches } from '@/lib/db/events'
import EventList from '@/components/events/EventList'

export const metadata = {
  title: 'Event Overview | Splitify',
  description: 'View all your events',
}

export default async function OverviewPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value
  const user = await getUserByValidSessionToken(sessionToken)

  if (!user) {
    redirect('/login')
  }

  const eventsInDb = await getAllEventsWhereIdMatches(user.id)

  return <EventList eventsInDb={eventsInDb || []} user={user} />
}
