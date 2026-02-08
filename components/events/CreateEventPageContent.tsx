'use client'
/** @jsxImportSource @emotion/react */

import { useState } from 'react'
import { css } from '@emotion/react'
import type { User, Event } from '@/types'
import type { events } from '@prisma/client'
import CreateEventForm from './CreateEventForm'
import EventList from './EventList'

const mainContainerDivStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid black;
  border-radius: 8px;
  margin: 0 auto;
  width: 348px;
`

const spanStyles = css`
  font-size: 20px;
  color: black;
  margin: 12px 0;
`

type CreateEventPageContentProps = {
  initialEvents: Event[]
  user: User
}

export default function CreateEventPageContent({
  initialEvents,
  user,
}: CreateEventPageContentProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)

  const handleEventCreated = (newEvent: events) => {
    setEvents([...events, newEvent])
  }

  return (
    <main css={mainContainerDivStyles}>
      <CreateEventForm user={user} onEventCreated={handleEventCreated} />

      {events.length > 0 && (
        <span css={spanStyles}>Click on your event to edit it</span>
      )}

      <EventList eventsInDb={events} user={user} />
    </main>
  )
}
