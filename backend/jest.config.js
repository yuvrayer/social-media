/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  setupFiles: ['<rootDir>/jest.setup.ts'],
  globalSetup: "<rootDir>/jest.globalSetup.ts",
  globalTeardown: "<rootDir>/jest.globalTeardown.ts",
  transform: {
    "^.+\.tsx?$": ["ts-jest", {}],
  },
};