const config = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/integration'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
}

export default config
