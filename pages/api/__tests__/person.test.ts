import type { NextApiRequest, NextApiResponse } from 'next'

jest.mock('../../../util/database', () => ({
  getUserByValidSessionToken: jest.fn(),
  createPerson: jest.fn(),
  deletePersonById: jest.fn(),
}))

import personHandler from '../person'
import {
  getUserByValidSessionToken,
  createPerson,
  deletePersonById,
} from '../../../util/database'

function createMockRes() {
  const res: Partial<NextApiResponse> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.setHeader = jest.fn().mockReturnValue(res)
  return res as NextApiResponse
}

function createReq(
  method: string,
  body: Record<string, unknown>,
  sessionToken = 'valid-token',
) {
  return {
    method,
    body,
    cookies: { sessionToken },
  } as unknown as NextApiRequest
}

const mockUser = { id: 1, username: 'alice' }

const mockPerson = {
  id: 7,
  name: 'Bob',
  event_id: 5,
  user_id: 1,
}

describe('/api/person', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(getUserByValidSessionToken).mockResolvedValue(mockUser)
    jest.mocked(createPerson).mockResolvedValue(mockPerson)
    jest.mocked(deletePersonById).mockResolvedValue(mockPerson)
  })

  describe('authentication', () => {
    it('returns 401 when not authenticated', async () => {
      jest.mocked(getUserByValidSessionToken).mockResolvedValue(undefined)
      const req = createReq('POST', {})
      const res = createMockRes()

      await personHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ message: 'Unothorized' }],
      })
    })
  })

  describe('POST — create person', () => {
    const validBody = {
      name: 'Bob',
      user: { id: 1, username: 'alice' },
      eventId: 5,
    }

    it('returns 400 when name is empty', async () => {
      const req = createReq('POST', { ...validBody, name: '' })
      const res = createMockRes()

      await personHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ message: 'Name not provided' }],
      })
    })

    it('returns 400 when user.username is missing', async () => {
      const req = createReq('POST', { name: 'Bob', user: { id: 1 }, eventId: 5 })
      const res = createMockRes()

      await personHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 201 with created person on valid request', async () => {
      const req = createReq('POST', validBody)
      const res = createMockRes()

      await personHandler(req, res)

      expect(createPerson).toHaveBeenCalledWith('Bob', 5, 1)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({ person: mockPerson })
    })
  })

  describe('DELETE — remove person', () => {
    const validBody = {
      personId: 7,
      user: { id: 1, username: 'alice' },
    }

    it('returns 400 when personId is missing', async () => {
      const req = createReq('DELETE', { user: { id: 1, username: 'alice' } })
      const res = createMockRes()

      await personHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        errors: [{ message: 'id or name not provided' }],
      })
    })

    it('returns 400 when personId is 0', async () => {
      const req = createReq('DELETE', { ...validBody, personId: 0 })
      const res = createMockRes()

      await personHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 when user.username is missing', async () => {
      const req = createReq('DELETE', { personId: 7, user: { id: 1 } })
      const res = createMockRes()

      await personHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 404 when person is not found', async () => {
      jest.mocked(deletePersonById).mockResolvedValue(null as never)
      const req = createReq('DELETE', validBody)
      const res = createMockRes()

      await personHandler(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('returns 201 with deleted person on success', async () => {
      const req = createReq('DELETE', validBody)
      const res = createMockRes()

      await personHandler(req, res)

      expect(deletePersonById).toHaveBeenCalledWith(7, 1)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({ person: mockPerson })
    })
  })

  it('returns 405 for unsupported methods', async () => {
    const req = createReq('GET', {})
    const res = createMockRes()

    await personHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Method not supported' }],
    })
  })
})
