/* @jsxImportSource react */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserByValidSessionToken } from '@/lib/db/users'
import {
  getSingleEvent,
  getProfileImageEvent,
} from '@/lib/db/events'
import { getAllPeopleWhereEventIdMatches } from '@/lib/db/people'
import { getAllExpensesWhereIdMatches } from '@/lib/db/expenses'
import EventDetail from '@/components/events/EventDetail'

type PageProps = {
  params: Promise<{ eventId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { eventId } = await params
  const event = await getSingleEvent(parseInt(eventId))

  return {
    title: event ? `${event.eventname} | Splitify` : 'Event | Splitify',
    description: 'View and manage event details',
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value
  const user = await getUserByValidSessionToken(sessionToken)

  if (!user) {
    redirect('/login')
  }

  const { eventId } = await params
  const eventIdNum = parseInt(eventId)

  // Fetch all data in parallel
  const [event, people, expenses, image] = await Promise.all([
    getSingleEvent(eventIdNum),
    getAllPeopleWhereEventIdMatches(eventIdNum),
    getAllExpensesWhereIdMatches(eventIdNum),
    getProfileImageEvent(eventIdNum),
  ])

  if (!event) {
    redirect('/overview')
  }

  return (
    <EventDetail
      event={event}
      peopleInDb={people || []}
      expensesInDb={expenses || []}
      imageurl={image?.imageurl || null}
      user={user}
      eventId={eventIdNum}
    />
  )
}
