import 'server-only'

import { prisma } from './prisma'

export async function getValidSessionByToken(token: string | undefined) {
  if (!token) return undefined

  const session = await prisma.sessions.findFirst({
    where: {
      token,
      expiry_timestamp: {
        gt: new Date(),
      },
    },
  })
  await deleteExpiredSessions()
  return session
}

export async function getValidSessionById(userId: number) {
  if (!userId) return undefined

  const session = await prisma.sessions.findFirst({
    where: {
      user_id: userId,
      expiry_timestamp: {
        gt: new Date(),
      },
    },
  })
  await deleteExpiredSessions()
  return session
}

export async function createSession(token: string, userId: number) {
  const session = await prisma.sessions.create({
    data: {
      token,
      user_id: userId,
    },
  })
  await deleteExpiredSessions()
  return session
}

export async function deleteSessionByToken(token: string) {
  if (!token) return undefined

  return await prisma.sessions.delete({
    where: {
      token,
    },
  })
}

export async function deleteExpiredSessions() {
  return await prisma.sessions.deleteMany({
    where: {
      expiry_timestamp: {
        lt: new Date(),
      },
    },
  })
}
