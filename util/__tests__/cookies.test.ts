import { createSerializedRegisterSessionTokenCookie } from '../cookies'

describe('cookies utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('createSerializedRegisterSessionTokenCookie', () => {
    it('should create a cookie string with the token', () => {
      process.env.NODE_ENV = 'development'

      const cookie =
        createSerializedRegisterSessionTokenCookie('test-token-123')

      expect(cookie).toContain('sessionToken=test-token-123')
    })

    it('should set httpOnly flag', () => {
      process.env.NODE_ENV = 'development'

      const cookie = createSerializedRegisterSessionTokenCookie('test-token')

      expect(cookie).toContain('HttpOnly')
    })

    it('should set path to root', () => {
      process.env.NODE_ENV = 'development'

      const cookie = createSerializedRegisterSessionTokenCookie('test-token')

      expect(cookie).toContain('Path=/')
    })

    it('should set SameSite to Lax', () => {
      process.env.NODE_ENV = 'development'

      const cookie = createSerializedRegisterSessionTokenCookie('test-token')

      expect(cookie).toContain('SameSite=Lax')
    })

    it('should not set Secure flag in development', () => {
      process.env.NODE_ENV = 'development'

      const cookie = createSerializedRegisterSessionTokenCookie('test-token')

      expect(cookie).not.toContain('Secure')
    })

    it('should set Secure flag in production', () => {
      process.env.NODE_ENV = 'production'

      const cookie = createSerializedRegisterSessionTokenCookie('test-token')

      expect(cookie).toContain('Secure')
    })

    it('should set Max-Age to 24 hours (86400 seconds)', () => {
      process.env.NODE_ENV = 'development'

      const cookie = createSerializedRegisterSessionTokenCookie('test-token')

      expect(cookie).toContain('Max-Age=86400')
    })

    it('should set an Expires date', () => {
      process.env.NODE_ENV = 'development'

      const cookie = createSerializedRegisterSessionTokenCookie('test-token')

      expect(cookie).toContain('Expires=')
    })

    it('should handle special characters in token', () => {
      process.env.NODE_ENV = 'development'

      const specialToken = 'token+with/special=chars'
      const cookie = createSerializedRegisterSessionTokenCookie(specialToken)

      expect(cookie).toContain('sessionToken=')
    })
  })
})
