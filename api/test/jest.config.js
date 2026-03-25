module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../',
  testEnvironment: 'node',
  testRegex: '\\.spec.ts$',
  setupFiles: ['<rootDir>/test/jest.setup-buffer.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        diagnostics: false,
      },
    ],
  },
  setupFilesAfterEnv: ['jest-extended/all'],
};
