import { css } from '@emotion/react'
import type { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import {
  getAllEventsWhereIdMatches,
  getUserByValidSessionToken,
  getValidSessionByToken,
} from '../util/database'
import type {
  CreateEventResponseBody,
  DeleteEventResponseBody,
} from './api/event'
import { removeButtonStyles } from './users/[eventId]'
import type { events } from '@prisma/client'

const errorStyles = css`
  color: red;
  font-size: 20px;
`
export const divPersonListStyles = css`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 12px auto;
`
export const formStyles = css`
  display: flex;
  width: 300px;
  flex-direction: column;
  gap: 12px;
  margin: 12px;
`

const mainContainerDivStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid black;
  border-radius: 8px;
  margin: 0 auto;
  width: 348px;
`

export const smallContainerDivStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;

  h1 {
    font-size: 20px;
  }
`
export const spanStyles = css`
  font-size: 20px;
  color: black;
`
export const inputSubmitStyles = css`
  background-image: linear-gradient(to right top, #043159, #10528e, #2a689f);
  padding: 4px;
  font-size: 20px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  :hover {
    border: 2px solid #dc8409;
    transition: 0.3s ease-out;
  }
`
export const nameInputStyles = css`
  font-size: 20px;

  border-radius: 4px;
  padding: 4px;
  :focus {
    transition: 0.3s ease-out;
  }
`

export const personStyles = css`
  display: flex;
  padding: 4px;
`
export const eventListStyles = css`
  margin: 12px;
  display: flex;
  justify-content: flex-start;

  gap: 12px;
  flex-wrap: wrap;
  a {
    color: black;
    text-decoration: none;
  }
`

type CreateEventProps = {
  eventsInDb: events[]
  user?: { id: number; username: string }

  errors?: string
}

export type Errors = { message: string }[]

const CreateEvent = ({ eventsInDb, user, errors }: CreateEventProps) => {
  const [eventName, setEventName] = useState('')
  const [eventList, setEventList] = useState<events[]>(eventsInDb)
  const [formErrors, setFormErrors] = useState<Errors | undefined>([])

  if (errors) {
    return (
      <main>
        <p>{errors}</p>
      </main>
    )
  }
  const deleteEvent = async (id: number) => {
    const deleteResponse = await fetch(`/api/event`, {
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
      setFormErrors(deleteEventResponseBody.errors)
      return
    }

    const newEventList = eventList.filter((event) => {
      return deleteEventResponseBody.event.id !== event.id
    })

    setEventList(newEventList)
  }

  return (
    <>
      <Head>
        <title>Create a new Event</title>
        <meta name="Create New Events" content="" />
      </Head>
      <main css={mainContainerDivStyles}>
        <div css={smallContainerDivStyles}>
          <h1>Create a new Event</h1>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const createPersonResponse = await fetch('/api/event', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  eventname: eventName,
                  user: user,
                }),
              })

              const createEventResponseBody =
                (await createPersonResponse.json()) as CreateEventResponseBody
              if ('event' in createEventResponseBody) {
                const createdEvents: events[] = [
                  ...eventList,
                  createEventResponseBody.event,
                ]

                setEventList(createdEvents)
                setEventName('')
              }

              if ('errors' in createEventResponseBody) {
                setFormErrors(createEventResponseBody.errors)
                return
              }
            }}
            css={formStyles}
          >
            <label htmlFor="event-name">
              <span css={spanStyles}>Event Name</span>
            </label>
            <input
              css={nameInputStyles}
              data-test-id="create-event"
              placeholder="Event Name"
              id="event-name"
              value={eventName}
              onChange={(e) => setEventName(e.currentTarget.value)}
              required
            />

            <input
              css={inputSubmitStyles}
              data-test-id="complete-create-event"
              name="submit"
              type="submit"
              value="Create"
            />
          </form>
        </div>
        {eventList.length === 0 ? (
          ''
        ) : (
          <span css={spanStyles}>Click on your event to edit it</span>
        )}
        <div css={eventListStyles}>
          {eventList.map((event: events) => {
            return (
              <div
                data-test-id={`event-${event.id}`}
                key={`this is ${event.eventname} witdh ${event.id}`}
              >
                <Link
                  data-test-id={`event-${event.eventname}`}
                  css={spanStyles}
                  href={`/users/${event.id}`}
                >
                  {event.eventname}
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

        <div css={errorStyles}>
          {formErrors !== undefined
            ? formErrors.map((error) => {
                return <div key={`error-${error.message}`}>{error.message}</div>
              })
            : ''}
        </div>
      </main>
    </>
  )
}

export default CreateEvent

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const sessionToken = context.req.cookies.sessionToken
  const session = await getValidSessionByToken(sessionToken)
  if (!session) {
    return {
      props: {
        errors: 'You are not allowed to see this page, please login',
      },
    }
  }
  const user = await getUserByValidSessionToken(sessionToken)

  if (!user) {
    return {
      props: {
        errors: 'You are not logged in',
      },
    }
  }

  const eventsInDb = await getAllEventsWhereIdMatches(user.id)

  if (!eventsInDb) {
    return {
      props: {
        errors: 'You are not logged in',
      },
    }
  }

  return {
    props: {
      eventsInDb: eventsInDb,
      user: user,
    },
  }
}
