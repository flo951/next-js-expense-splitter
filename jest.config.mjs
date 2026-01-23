const config = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/integration'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'babel-jest',
      {
        presets: ['@babel/preset-env', '@babel/preset-typescript'],
        // Ignore the babel.config.js file to avoid version conflicts
        configFile: false,
        babelrc: false,
      },
    ],
  },
};

export default config;
