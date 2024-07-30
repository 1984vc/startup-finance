/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["build"],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  }
};
