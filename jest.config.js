module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  // collectCoverage: !!`Boolean(process.env.CI)`,
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: ['/templates/'],
  modulePathIgnorePatterns: ['tmp', 'lib'],
  testPathIgnorePatterns: ['/node_modules/'],
  globals: {
    'ts-jest': {
      tsConfig: 'test/tsconfig.json'
    }
  }
}
