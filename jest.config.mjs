const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^node:crypto$': '<rootDir>/__mocks__/crypto.js',
    '^node:(.*)$': '$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default config
