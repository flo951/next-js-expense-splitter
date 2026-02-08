'use client'
/** @jsxImportSource @emotion/react */

import { useState, useEffect } from 'react'
import { css } from '@emotion/react'
import Link from 'next/link'
import Image from 'next/image'
import type { Event, User, DeleteEventResponseBody } from '@/types'
import {
  eventListStyles,
  personStyles,
  spanStyles,
  removeButtonStyles,
  eventProfilePicStyles,
} from '@/styles/shared'

const mainStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const borderEventListStyles = css`
  border: 2px solid black;
  border-radius: 8px;
  width: 348px;
  h3 {
    text-align: center;
  }
`

const flexRowStyles = css`
  display: flex;
  align-items: flex-start;

  a {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
  }
`

type EventListProps = {
  eventsInDb: Event[]
  user: User
}

type Errors = { message: string }[]

export default function EventList({ eventsInDb, user }: EventListProps) {
  const [errorsView, setErrorsView] = useState<Errors | undefined>([])
  const [eventList, setEventList] = useState<Event[]>(eventsInDb)

  // Sync internal state when prop changes
  useEffect(() => {
    setEventList(eventsInDb)
  }, [eventsInDb])

  // function to delete created events
  const deleteEvent = async (id: number) => {
    const deleteResponse = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: id,
        user: user,
      }),
    })
    const deleteEventResponseBody =
      (await deleteResponse.json()) as DeleteEventResponseBody

    if ('errors' in deleteEventResponseBody) {
      setErrorsView(deleteEventResponseBody.errors)
      return
    }

    const newEventList = eventList.filter((event) => {
      return deleteEventResponseBody.event.id !== event.id
    })

    setEventList(newEventList)
  }

  return (
    <main css={mainStyles}>
      {errorsView && errorsView.length > 0 && (
        <div>
          {errorsView.map((error) => (
            <p key={error.message}>{error.message}</p>
          ))}
        </div>
      )}

      {/* Event List */}
      <div css={borderEventListStyles}>
        <h3>
          {eventList.length === 0
            ? ' You have no events yet, click on the Link above to create an event'
            : `This are your events ${user.username}`}
        </h3>
        <div css={eventListStyles}>
          {eventList.map((event: Event) => {
            return (
              <div
                data-test-id={`event-${event.id}`}
                key={`This is ${event.eventname} witdh ${event.id}`}
                css={flexRowStyles}
              >
                <Link href={`/events/${event.id}`}>
                  <Image
                    css={eventProfilePicStyles}
                    src={
                      event.imageurl
                        ? event.imageurl
                        : '/images/maldives-1993704_640.jpg'
                    }
                    alt={`Profile Picture of ${event.eventname}`}
                    width={50}
                    height={50}
                  />
                  <div css={personStyles}>
                    <span css={spanStyles}>{event.eventname}</span>
                  </div>
                </Link>
                <button
                  css={removeButtonStyles}
                  onClick={() => {
                    deleteEvent(event.id).catch(() => {})
                  }}
                >
                  X
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
