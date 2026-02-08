import type { NextRequest} from 'next/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { User } from '@/types'
import { getUserByValidSessionToken } from '@/lib/db/users'
import {
  deleteEventById,
  insertImageUrlEvent,
} from '@/lib/db/events'
import type { events } from '@prisma/client'

export type DeleteEventResponseBody =
  | { errors: { message: string }[] }
  | { event: events }

export type UpdateEventImageResponseBody =
  | { errors: { message: string }[] }
  | { imageurl: events }

type DeleteEventRequestBody = {
  eventId: number
  user: User
}

type UpdateImageRequestBody = {
  uploadUrl: string
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  // Check if user is logged in
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value
  const user = await getUserByValidSessionToken(sessionToken)

  if (!user) {
    return NextResponse.json(
      {
        errors: [{ message: 'Unauthorized' }],
      },
      { status: 401 },
    )
  }

  const body: DeleteEventRequestBody = await request.json()
  const { eventId: _eventId } = await params

  if (
    typeof body.eventId !== 'number' ||
    !body.eventId ||
    typeof body.user.username !== 'string' ||
    !body.user.username
  ) {
    return NextResponse.json(
      {
        errors: [{ message: 'id or event name not provided' }],
      },
      { status: 400 },
    )
  }

  const deletedEvent = await deleteEventById(body.eventId, body.user.id)

  if (!deletedEvent) {
    return NextResponse.json(
      { errors: [{ message: 'Event not found' }] },
      { status: 404 },
    )
  }

  return NextResponse.json({ event: deletedEvent }, { status: 200 })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  // Check if user is logged in
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value
  const user = await getUserByValidSessionToken(sessionToken)

  if (!user) {
    return NextResponse.json(
      {
        errors: [{ message: 'Unauthorized' }],
      },
      { status: 401 },
    )
  }

  const { eventId } = await params
  const eventIdNum = parseInt(eventId)

  if (!eventIdNum) {
    return NextResponse.json(
      {
        errors: [{ message: 'Invalid event ID' }],
      },
      { status: 400 },
    )
  }

  const body: UpdateImageRequestBody = await request.json()

  if (typeof body.uploadUrl !== 'string' || !body.uploadUrl) {
    return NextResponse.json(
      {
        errors: [{ message: 'Upload URL not provided' }],
      },
      { status: 400 },
    )
  }

  const imgUrl = await insertImageUrlEvent(body.uploadUrl, eventIdNum)

  return NextResponse.json({ imageurl: imgUrl }, { status: 200 })
}
