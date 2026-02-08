import 'server-only'

import { prisma } from './prisma'

export async function createPerson(
  personName: string,
  eventId: number,
  userId: number,
) {
  return await prisma.people.create({
    data: {
      name: personName,
      event_id: eventId,
      user_id: userId,
    },
  })
}

export async function deletePersonById(id: number, userId: number) {
  return await prisma.people.delete({
    where: {
      id,
      user_id: userId,
    },
  })
}

export async function getAllPeopleWhereEventIdMatches(eventId: number) {
  return await prisma.people.findMany({
    where: {
      event_id: eventId,
    },
    select: {
      id: true,
      name: true,
      event_id: true,
      user_id: true,
    },
  })
}
