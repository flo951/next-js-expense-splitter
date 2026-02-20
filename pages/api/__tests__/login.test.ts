import type { NextApiRequest, NextApiResponse } from 'next'

jest.mock('../../../util/database', () => ({
  getUserWithPasswordHashByUsername: jest.fn(),
  createSession: jest.fn(),
}))

jest.mock('../../../util/auth', () => ({
  verifyCsrfToken: jest.fn(),
}))

jest.mock('../../../util/cookies', () => ({
  createSerializedRegisterSessionTokenCookie: jest.fn(),
}))

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}))

import loginHandler from '../login'
import {
  getUserWithPasswordHashByUsername,
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

describe('POST /api/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(verifyCsrfToken).mockReturnValue(true)
    jest.mocked(getUserWithPasswordHashByUsername).mockResolvedValue({
      id: 1,
      username: 'alice',
      password_hash: 'hashed_password',
    })
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never)
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

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Username, password or CSRF Token not provided' }],
    })
  })

  it('returns 400 when password is empty', async () => {
    const req = createPostReq({ username: 'alice', password: '', csrfToken: 'tok' })
    const res = createMockRes()

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when csrfToken is missing', async () => {
    const req = createPostReq({ username: 'alice', password: 'pass' })
    const res = createMockRes()

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 403 when CSRF token is invalid', async () => {
    jest.mocked(verifyCsrfToken).mockReturnValue(false)
    const req = createPostReq({ username: 'alice', password: 'pass', csrfToken: 'bad' })
    const res = createMockRes()

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Invalid CSRF token' }],
    })
  })

  it('returns 401 when username does not exist', async () => {
    jest.mocked(getUserWithPasswordHashByUsername).mockResolvedValue(null)
    const req = createPostReq({ username: 'nobody', password: 'pass', csrfToken: 'tok' })
    const res = createMockRes()

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: "Username or Password doesn't exist" }],
    })
  })

  it('returns 401 when password is wrong', async () => {
    jest.mocked(bcrypt.compare).mockResolvedValue(false as never)
    const req = createPostReq({ username: 'alice', password: 'wrong', csrfToken: 'tok' })
    const res = createMockRes()

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: "Username or Password doesn't exist" }],
    })
  })

  it('returns 201 and sets session cookie on successful login', async () => {
    const req = createPostReq({ username: 'alice', password: 'pass', csrfToken: 'tok' })
    const res = createMockRes()

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', 'sessionToken=abc; HttpOnly')
    expect(res.json).toHaveBeenCalledWith({ user: { id: 1 } })
  })

  it('compares submitted password against stored hash', async () => {
    const req = createPostReq({ username: 'alice', password: 'mypassword', csrfToken: 'tok' })
    const res = createMockRes()

    await loginHandler(req, res)

    expect(bcrypt.compare).toHaveBeenCalledWith('mypassword', 'hashed_password')
  })

  it('returns 405 for GET requests', async () => {
    const req = { method: 'GET', body: {}, cookies: {} } as unknown as NextApiRequest
    const res = createMockRes()

    await loginHandler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({
      errors: [{ message: 'Method not supported' }],
    })
  })
})
