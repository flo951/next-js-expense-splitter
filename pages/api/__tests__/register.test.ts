import type { NextApiRequest, NextApiResponse } from 'next'

jest.mock('../../../util/database', () => ({
  getUserByUsername: jest.fn(),
  createUser: jest.fn(),
  createSession: jest.fn(),
}))

jest.mock('../../../util/auth', () => ({
  verifyCsrfToken: jest.fn(),
}))

jest.mock('../../../util/cookies', () => ({
  createSerializedRegisterSessionTokenCookie: jest.fn(),
}))

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}))

import registerHandler from '../register'
import {
  getUserByUsername,
  createUser,
  createSession,
} from '../../../util/database'
import { verifyCsrfToken } from '../../../util/auth'
import { createSerializedRegisterSessionTokenCookie } from '../../../util/cookies'
import bcrypt from 'bcrypt'

function createMockRes() {
  const res: Partial<NextApiResponse> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.setHeader = jest.fn().mockReturnValue(res)
  return res as NextApiResponse
}

function createPostReq(body: Record<string, unknown>) {
  return {
    method: 'POST',
    body,
    cookies: {},
  } as unknown as NextApiRequest
}

describe('POST /api/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(verifyCsrfToken).mockReturnValue(true)
    jest.mocked(getUserByUsername).mockResolvedValue(null)
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as never)
    jest.mocked(createUser).mockResolvedValue({ id: 1, username: 'alice', password_hash: 'hashed_password' })
    jest.mocked(createSession).mockResolvedValue({
      id: 1,
      token: 'session-token',
      user_id: 1,
      expiry_timestamp: new Date(),
    })
    jest.mocked(createSerializedRegisterSessionTokenCookie).mockResolvedValue(
      'sessionToken=abc; HttpOnly',
    )
  })

  it('returns 400 when username is empty', async () => {
    const req = createPostReq({ username: '', password: 'pass', csrfToken: 'tok' })
    const res = createMockRes()

    await registerHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Username,Password or CSRF token not provided' }],
    })
  })

  it('returns 400 when password is empty', async () => {
    const req = createPostReq({ username: 'alice', password: '', csrfToken: 'tok' })
    const res = createMockRes()

    await registerHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when csrfToken is missing', async () => {
    const req = createPostReq({ username: 'alice', password: 'pass' })
    const res = createMockRes()

    await registerHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 403 when CSRF token is invalid', async () => {
    jest.mocked(verifyCsrfToken).mockReturnValue(false)
    const req = createPostReq({ username: 'alice', password: 'pass', csrfToken: 'bad' })
    const res = createMockRes()

    await registerHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Invalid CSRF token' }],
    })
  })

  it('returns 409 when username is already taken', async () => {
    jest.mocked(getUserByUsername).mockResolvedValue({ id: 42 })
    const req = createPostReq({ username: 'alice', password: 'pass', csrfToken: 'tok' })
    const res = createMockRes()

    await registerHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Username already taken' }],
    })
  })

  it('returns 201 and sets cookie on successful registration', async () => {
    const req = createPostReq({ username: 'alice', password: 'pass', csrfToken: 'tok' })
    const res = createMockRes()

    await registerHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', 'sessionToken=abc; HttpOnly')
    expect(res.json).toHaveBeenCalledWith({})
  })

  it('hashes the password before storing', async () => {
    const req = createPostReq({ username: 'alice', password: 'mypassword', csrfToken: 'tok' })
    const res = createMockRes()

    await registerHandler(req, res)

    expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 12)
    expect(createUser).toHaveBeenCalledWith('alice', 'hashed_password')
  })

  it('returns 405 for GET requests', async () => {
    const req = { method: 'GET', body: {}, cookies: {} } as unknown as NextApiRequest
    const res = createMockRes()

    await registerHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Method not supported' }],
    })
  })
})
