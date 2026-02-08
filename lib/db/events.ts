import 'server-only'

import { prisma } from './prisma'

export async function createEvent(eventName: string, userId: number) {
  return await prisma.events.create({
    data: {
      eventname: eventName,
      user_id: userId,
    },
  })
}

export async function insertImageUrlEvent(imageUrl: string, eventId: number) {
  return await prisma.events.update({
    where: {
      id: eventId,
    },
    data: {
      imageurl: imageUrl,
    },
  })
}

export async function getProfileImageEvent(eventId: number) {
  return await prisma.events.findUnique({
    where: {
      id: eventId,
    },
    select: {
      imageurl: true,
    },
  })
}

export async function deleteEventById(id: number, userId: number) {
  return await prisma.events.delete({
    where: {
      id,
      user_id: userId,
    },
  })
}

export async function getAllEventsWhereIdMatches(userId: number) {
  if (!userId) return undefined

  return await prisma.events.findMany({
    where: {
      user_id: userId,
    },
    select: {
      id: true,
      eventname: true,
      imageurl: true,
      user_id: true,
    },
  })
}

export async function getSingleEvent(eventId: number) {
  return await prisma.events.findUnique({
    where: {
      id: eventId,
    },
  })
}
