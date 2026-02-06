import { createCsrfToken, verifyCsrfToken } from '../auth'

describe('auth utilities', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('createCsrfToken', () => {
    it('should throw error when CSRF_SECRET_SALT is not defined', () => {
      delete process.env.CSRF_SECRET_SALT

      expect(() => createCsrfToken()).toThrow('CSRF_SECRET_SALT is not defined')
    })

    it('should create a token when CSRF_SECRET_SALT is defined', () => {
      process.env.CSRF_SECRET_SALT = 'test-secret-salt'

      const token = createCsrfToken()

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should create different tokens on each call', () => {
      process.env.CSRF_SECRET_SALT = 'test-secret-salt'

      const token1 = createCsrfToken()
      const token2 = createCsrfToken()

      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyCsrfToken', () => {
    it('should throw error when CSRF_SECRET_SALT is not defined', () => {
      delete process.env.CSRF_SECRET_SALT

      expect(() => verifyCsrfToken('some-token')).toThrow(
        'CSRF_SECRET_SALT is not defined',
      )
    })

    it('should return true for a valid token', () => {
      process.env.CSRF_SECRET_SALT = 'test-secret-salt'

      const token = createCsrfToken()
      const isValid = verifyCsrfToken(token)

      expect(isValid).toBe(true)
    })

    it('should return false for an invalid token', () => {
      process.env.CSRF_SECRET_SALT = 'test-secret-salt'

      const isValid = verifyCsrfToken('invalid-token')

      expect(isValid).toBe(false)
    })

    it('should return false for an empty token', () => {
      process.env.CSRF_SECRET_SALT = 'test-secret-salt'

      const isValid = verifyCsrfToken('')

      expect(isValid).toBe(false)
    })
  })
})
