module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/entity/**',
    '!src/index.ts',
    '!src/MyContext.ts',
    '!src/utils/createTypeOrmConnection.ts',
  ],
};
