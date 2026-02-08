'use client'
/** @jsxImportSource @emotion/react */

import { useState } from 'react'
import { css } from '@emotion/react'
import type { User, CreateEventResponseBody, Errors } from '@/types'
import type { events } from '@prisma/client'
import {
  formStyles,
  nameInputStyles,
  inputSubmitStyles,
  spanStyles,
  smallContainerDivStyles,
} from '@/styles/shared'

const errorStyles = css`
  color: red;
  font-size: 20px;
`

type CreateEventFormProps = {
  user: User
  onEventCreated: (event: events) => void
}

export default function CreateEventForm({
  user,
  onEventCreated,
}: CreateEventFormProps) {
  const [eventName, setEventName] = useState('')
  const [formErrors, setFormErrors] = useState<Errors>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const createEventResponse = await fetch('/api/events', {
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
      (await createEventResponse.json()) as CreateEventResponseBody

    if ('event' in createEventResponseBody) {
      onEventCreated(createEventResponseBody.event)
      setEventName('')
      setFormErrors([])
    }

    if ('errors' in createEventResponseBody) {
      setFormErrors(createEventResponseBody.errors)
    }
  }

  return (
    <div css={smallContainerDivStyles}>
      <h1>Create a new Event</h1>

      <form onSubmit={handleSubmit} css={formStyles}>
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

      {formErrors.length > 0 && (
        <div css={errorStyles}>
          {formErrors.map((error) => (
            <div key={`error-${error.message}`}>{error.message}</div>
          ))}
        </div>
      )}
    </div>
  )
}
