import path from 'path'
import fs from 'fs-extra'
import { Config } from '@jest/types'
import { pathsToModuleNameMapper } from 'ts-jest/utils'
import { TsrvConfig } from '../../config'
// import { createBabelConfig } from '../bable'
export type JestConfigOptions = Partial<Config.InitialOptions>

export async function createJestConfig(config: TsrvConfig): Promise<JestConfigOptions> {
  const jestConfigPath = path.join(config.root, 'jest.config.js')
  let jestUserConfig: JestConfigOptions = {
    globals: {},
    moduleNameMapper: {},
    transform: {}
  }
  if (await fs.pathExists(jestConfigPath)) {
    const userConfig = require(jestConfigPath)
    jestUserConfig = Object.assign({}, jestUserConfig, userConfig)
  }
  const jestConfig: JestConfigOptions = {
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'vue', 'json', 'node'],
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'lcov', 'text'],
    collectCoverageFrom: ['<rootDir>/src/**/*.{vue,ts,tsx,js,jsx}'],
    watchPathIgnorePatterns: ['/node_modules/', '/dist/'],
    testMatch: ['<rootDir>/**/*.(spec|test).{ts,tsx,js,jsx}'],
    rootDir: config.root,
    ...jestUserConfig,
    transform: {
      '^.+\\.vue$': require.resolve('vue-jest'),
      '^.+\\.(js|jsx)$': require.resolve('babel-jest'),
      '^.+\\.(ts|tsx)$': require.resolve('ts-jest'),
      ...jestUserConfig.transform
    },
    moduleNameMapper: {
      ...pathsToModuleNameMapper(config.tsconfigOptions.compilerOptions.paths || {}, {
        prefix: '<rootDir>/'
      }),
      ...jestUserConfig.moduleNameMapper
    },
    globals: {
      ...jestUserConfig.globals,
      __DEV__: true,
      __TEST__: true,
      'ts-jest': {
        babelConfig: true
      }
    }

    // watchPlugins: [require.resolve('jest-watch-typeahead/filename'), require.resolve('jest-watch-typeahead/testname')]
  }

  return jestConfig
}
