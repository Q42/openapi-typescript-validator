module.exports = {
  automock: false,
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/generated', '<rootDir>/build'],
  verbose: true,
};
