import 'server-only'

import { prisma } from './prisma'

export async function getUserById(id: number) {
  return await prisma.users.findUnique({
    where: {
      id: id,
    },
  })
}

export async function getUserByValidSessionToken(token: string | undefined) {
  if (!token) return undefined

  return await prisma.users.findFirst({
    where: {
      sessions: {
        some: {
          token: token,
          expiry_timestamp: {
            gt: new Date(),
          },
        },
      },
    },
    select: {
      id: true,
      username: true,
    },
  })
}

export async function getUserByUsername(username: string) {
  return await prisma.users.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  })
}

export async function getUserWithPasswordHashByUsername(username: string) {
  return await prisma.users.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      password_hash: true,
    },
  })
}

export async function createUser(username: string, passwordHash: string) {
  return await prisma.users.create({
    data: {
      username,
      password_hash: passwordHash,
    },
  })
}
