// Shim so Jest can resolve `node:crypto` imports in the jsdom test environment.
// The moduleNameMapper in jest.config.mjs points `node:crypto` here.
const crypto = require('crypto')
module.exports = crypto
