module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  testMatch: ['<rootDir>/**/*(*.)@(test).[tj]s?(x)'],
  moduleFileExtensions: ['ts', 'js', 'vue', 'json'],
  testPathIgnorePatterns: [
    '/node_modules/', // default
    '<rootDir>/templates/',
    '<rootDir>/test/.*/fixtures/',
    '<rootDir>/stage-.*/' // don't run tests in auto-generated (and auto-removed) test dirs
  ]
}
