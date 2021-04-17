module.exports = {
  automock: false,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/generated'],
  verbose: true,
};
